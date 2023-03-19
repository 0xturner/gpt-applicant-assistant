import useLocalStorage from "hooks/useLocalStorage";
import { useEffect, useState } from "react";

import { useMutation } from "@tanstack/react-query";

const generateAnswer = async (resume: string, jobDescription: string) => {
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
      const stream = await generateAnswer(resumeInput, jobDescription);
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

  return { ...mutation, data: answer };
};

export default function Home() {
  const [resumeInput, setResumeInput] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [storedResume, setStoredResume] = useLocalStorage("resume", "");

  const mutation = useChatMutation(resumeInput, jobDescription);

  // sync the resume in local storage with the resume input state
  useEffect(() => {
    if (storedResume) {
      setResumeInput(storedResume);
    }
  }, [storedResume]);

  return (
    <div className="mt-4 rounded-2xl  border-zinc-100 lg:border lg:p-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Your resume</span>
          <span className="label-text-alt">Alt label</span>
        </label>
        <textarea
          className="textarea-bordered textarea h-24"
          placeholder="Paste your resume here"
          value={resumeInput}
          onChange={(e) => {
            setResumeInput(e.target.value);
          }}
        />
        <label className="label">
          <span className="label-text">Your job description</span>
          <span className="label-text-alt">Alt label</span>
        </label>
        <textarea
          className="textarea-bordered textarea h-24"
          placeholder="Paste the job description here"
          value={jobDescription}
          onChange={(e) => {
            setJobDescription(e.target.value);
          }}
        />
        <button
          className="btn-primary btn mt-4"
          onClick={() => {
            setStoredResume(resumeInput);
            mutation.mutate();
          }}
        >
          {mutation.isLoading ? "Loading..." : "Generate"}
        </button>
      </div>
      <div className="mt-8 whitespace-pre-line">
        {mutation.data ? mutation.data : null}
      </div>
    </div>
  );
}
