import { ipRateLimit } from "@lib/ip-rate-limit";
import { NextRequest, NextResponse } from "next/server";

import {
  ChatGPTMessage,
  OpenAIStream,
  OpenAIStreamPayload,
} from "../../utils/OpenAIStream";
import { mockStream } from "utils/mockStream";

const LIVE_API = false;

// break the app if the API key is missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing Environment Variable OPENAI_API_KEY");
}

export const config = {
  runtime: "edge", // TODO should we even be using edge?
};

const handler = async (req: NextRequest): Promise<Response> => {
  const res = await ipRateLimit(req);
  // If the status is not 200 then it has been rate limited.
  if (res.status !== 200) return res;

  const body = await req.json();

  // TODO parse the body

  const messages: ChatGPTMessage[] = [
    {
      role: "system",
      content: "You are a helpful assistant that helps job applicants.",
    },
    {
      role: "user",
      content: `Write my cover letter for a job application in a conversational tone. Use my resume and the job description below as reference. \nResume:\n${body.resume}\nJob Description:\n${body.jobDescription}`,
    },
  ];

  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages,
    temperature: process.env.AI_TEMP ? parseFloat(process.env.AI_TEMP) : 0.2,
    max_tokens: process.env.AI_MAX_TOKENS
      ? parseInt(process.env.AI_MAX_TOKENS)
      : 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    // user: body?.user,
    n: 1,
  };

  const stream = LIVE_API ? await OpenAIStream(payload) : await mockStream();

  return new NextResponse(stream);
};

export default handler;
