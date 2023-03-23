import { ipRateLimit } from "@lib/ip-rate-limit";
import { NextResponse } from "next/server";

import { mockStream } from "utils/mockStream";
import { moderateOpenAIText, tokenizeMessages } from "utils/openAI";
import {
  ChatGPTMessage,
  OpenAIStream,
  OpenAIStreamPayload,
} from "utils/OpenAIStream";
import { ChatRequest, chatRequest } from "parsers/chat";

const LIVE_API = false;
const INPUT_TOKEN_LIMIT = 800; // TODO add to env

// break the app if the API key is missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing Environment Variable OPENAI_API_KEY");
}

export const config = {
  runtime: "edge", // TODO should we even be using edge? Might need to to support streaming
};

// TODO
// jest test (or vitest??)
// mock ipRateLimit
// mock create moderation (MSW??)
// check parse failure error
// create parsing/validation middleware

const handler = async (req: Request): Promise<Response> => {
  let body;
  try {
    body = chatRequest.parse(await req.json());
  } catch (err) {
    return new NextResponse(null, {
      status: 400,
      statusText: "invalid request body type",
    });
  }

  const messages = getMessages(body);
  const tokens = tokenizeMessages(messages);

  if (tokens.length > INPUT_TOKEN_LIMIT) {
    return new NextResponse(null, {
      status: 400,
      statusText: "exceeds token limit",
    });
  }

  try {
    await moderateOpenAIText(body.resume + " " + body.jobDescription);
  } catch (e) {
    return new NextResponse(null, {
      status: 400,
      statusText: "flagged content",
    });
  }

  // rate limit the request before sending to OpenAI since it's expensive
  const resp = await ipRateLimit(req);
  // If the status is not 200 then it has been rate limited.
  if (resp.status !== 200) return resp;

  const stream = LIVE_API
    ? await OpenAIStream(getOpenAIPayload(messages))
    : await mockStream();

  return new NextResponse(stream);
};

const getMessages = (body: ChatRequest): ChatGPTMessage[] => [
  {
    role: "system",
    content: "You are a helpful assistant that helps job applicants.",
  },
  {
    role: "user",
    content: `Write my cover letter for a job application in a conversational tone. Use my resume and the job description below as reference. \nResume:\n${body.resume}\nJob Description:\n${body.jobDescription}`,
  },
];

const getOpenAIPayload = (messages: ChatGPTMessage[]): OpenAIStreamPayload => ({
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
  // user: body?.user, // TODO add this later so OPENAI can block abusive users
  n: 1,
});

export default handler;
