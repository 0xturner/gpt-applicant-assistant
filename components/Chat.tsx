import { useEffect, useState } from "react";
import { Button } from "./Button";
import { type ChatGPTMessage, ChatLine, LoadingChatLine } from "./ChatLine";
import { useCookies } from "react-cookie";

const USER_COOKIE_NAME = "gpt-applicant-assistant-user";
const COUNTER_COOKIE_NAME = "gpt-applicant-assistant-counter";

// default first message to display in UI (not necessary to define the prompt)
export const initialMessages: ChatGPTMessage[] = [
  {
    role: "assistant",
    content:
      "Hi! I am a friendly AI assistant. Past your resume and the job description below!",
  },
];

const InputMessage = ({ input, setInput, sendMessage }: any) => (
  <div className="mt-6 flex clear-both">
    <textarea
      rows={4}
      aria-label="chat input"
      required
      className="min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:text-sm resize"
      value={input}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          sendMessage(input);
          setInput("");
        }
      }}
      onChange={(e) => {
        setInput(e.target.value);
      }}
    />
  </div>
);

const useCounter = () => {
  const [cookies, setCookie] = useCookies([COUNTER_COOKIE_NAME]);

  let counter = !isNaN(parseInt(cookies[COUNTER_COOKIE_NAME]))
    ? parseInt(cookies[COUNTER_COOKIE_NAME])
    : undefined;

  const incrementCounter = () => {
    const newCount = counter !== undefined ? counter + 1 : 0;
    setCookie(COUNTER_COOKIE_NAME, newCount);
  };

  useEffect(() => {
    if (counter === undefined) {
      setCookie(COUNTER_COOKIE_NAME, 0);
    }
  }, [cookies, setCookie]);

  return { counter, incrementCounter };
};

export function Chat() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [cookies, setCookie] = useCookies([USER_COOKIE_NAME]);

  const [hasMounted, setHasMounted] = useState(false);

  const { counter, incrementCounter } = useCounter();

  useEffect(() => {
    if (!cookies[USER_COOKIE_NAME]) {
      // generate a semi random short id
      const randomId = Math.random().toString(36).substring(7);
      setCookie(USER_COOKIE_NAME, randomId);
    }
  }, [cookies, setCookie]);

  // send message to API /api/chat endpoint
  const sendMessage = async (resume: string, jobDescription: string) => {
    setLoading(true);
    const newMessages = [
      // ...messages,
      { role: "user", content: resume } as ChatGPTMessage,
      { role: "user", content: jobDescription } as ChatGPTMessage,
    ];
    // setMessages(newMessages);
    const last10messages = newMessages.slice(-10); // remember last 10 messages

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: last10messages,
        user: cookies[USER_COOKIE_NAME],
      }),
    });

    // console.log("Edge function returned.");

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    let lastMessage = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      lastMessage = lastMessage + chunkValue;
      // console.log("lastMessage: ", JSON.parse(lastMessage));

      setAnswer(JSON.parse(lastMessage).answer);

      incrementCounter();

      // setMessages([
      //   ...messages,
      //   { role: "assistant", content: lastMessage } as ChatGPTMessage,
      // ]);

      setLoading(false);
    }
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <div className="rounded-2xl border-zinc-100  lg:border lg:p-4">
      <div>Counter: {hasMounted ? counter : "Loading..."}</div>
      {initialMessages.map(({ content, role }, index) => (
        <ChatLine key={index} role={role} content={content} />
      ))}

      <span className="mx-auto flex flex-grow text-gray-600 clear-both">
        Resume:
      </span>
      <InputMessage
        input={resume}
        setInput={setResume}
        sendMessage={sendMessage}
      />
      <br />
      <span className="mx-auto flex flex-grow text-gray-600 clear-both">
        Job Description:
      </span>
      <InputMessage
        input={jobDescription}
        setInput={setJobDescription}
        sendMessage={sendMessage}
      />

      {loading && <LoadingChatLine />}

      {!loading && !answer && (
        <Button
          type="submit"
          className="mt-4"
          onClick={() => {
            sendMessage(resume, jobDescription);
          }}
        >
          Submit
        </Button>
      )}

      <div className="ml-8 mt-6">
        <ChatLine role={"assistant"} content={answer} />
      </div>
    </div>
  );
}
