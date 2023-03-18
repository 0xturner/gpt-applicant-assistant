import useLocalStorage from "hooks/useLocalStorage";
import { useEffect, useState } from "react";

export default function Home() {
  const [resumeInput, setResumeInput] = useState("");
  const [storedResume, setStoredResume] = useLocalStorage("resume", "");

  const submit = async (resume: string) => {
    setStoredResume(resume);
    window.alert(`Submitted: ${resume}`);
  };

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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              submit(resumeInput);
            }
          }}
        ></textarea>
      </div>
    </div>
  );
}
