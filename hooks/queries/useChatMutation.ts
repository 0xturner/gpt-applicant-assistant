import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

const postChat = async (resume: string, jobDescription: string) => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      resume,
      jobDescription,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error("Network response was not ok");
  }

  return response.body;
};

const useChatMutation = (resumeInput: string, jobDescription: string) => {
  const [answer, setAnswer] = useState("");
  const mutation = useMutation({
    mutationFn: async () => {
      setAnswer("");
      const stream = await postChat(resumeInput, jobDescription);
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        setAnswer((prev) => prev + chunkValue);
      }
    },
  });

  // mutation.data is the raw Stream returned by the API which we don't really want, so overwite it
  // with the decoded answer
  return { ...mutation, data: answer };
};

export default useChatMutation;
