import { useEffect, useState } from "react";
import { Button } from "./Button";
import { type ChatGPTMessage, ChatLine, LoadingChatLine } from "./ChatLine";
import { useCookies } from "react-cookie";

const USER_COOKIE_NAME = "gpt-applicant-assistant-user";
const RATE_LIMIT_COOKIE_NAME = "rate-limit-remaining";

// default first message to display in UI (not necessary to define the prompt)
export const initialMessages: ChatGPTMessage[] = [
  {
    role: "assistant",
    content:
      "Hi! I am a friendly AI assistant. Past your resume and the job description below!",
  },
];

const InputMessage = ({ input, setInput, sendMessage }: any) => (
  <div className="clear-both mt-6 flex">
    <textarea
      rows={4}
      aria-label="chat input"
      required
      className="min-w-0 flex-auto resize appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:text-sm"
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

// hook to manage rate limit remaining count. This doesn't do the actual rate limiting, it
// just keeps track of the remaining count and updates it when a request is made
const useRateLimit = () => {
  const [cookies, setCookie] = useCookies([RATE_LIMIT_COOKIE_NAME]);

  let remaining = !isNaN(parseInt(cookies[RATE_LIMIT_COOKIE_NAME]))
    ? parseInt(cookies[RATE_LIMIT_COOKIE_NAME])
    : undefined;

  const setRemaining = (newCount: string | null) => {
    if (newCount === null) {
      console.error("error reading rate limit remaining");
      return;
    }
    setCookie(RATE_LIMIT_COOKIE_NAME, newCount);
  };

  useEffect(() => {
    if (remaining === undefined) {
      setCookie(RATE_LIMIT_COOKIE_NAME, 1000);
    }
  }, [remaining, setCookie]);

  return {
    remaining,
    setRemaining,
  };
};

export function Chat() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [cookies, setCookie] = useCookies([USER_COOKIE_NAME]);

  const [hasMounted, setHasMounted] = useState(false);

  const { remaining, setRemaining } = useRateLimit();

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
      {
        role: "user",
        content: resume,
      } as ChatGPTMessage,
      {
        role: "user",
        content: jobDescription,
      } as ChatGPTMessage,
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

    setRemaining(response.headers.get("x-ratelimit-remaining"));

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

      setAnswer(JSON.parse(lastMessage).answer);

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
      <div>Remaining: {hasMounted ? remaining : "Loading..."}</div>
      {initialMessages.map(({ content, role }, index) => (
        <ChatLine key={index} role={role} content={content} />
      ))}

      <span className="clear-both mx-auto flex flex-grow text-gray-600">
        Resume:
      </span>
      <InputMessage
        input={resume}
        setInput={setResume}
        sendMessage={sendMessage}
      />
      <br />
      <span className="clear-both mx-auto flex flex-grow text-gray-600">
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
