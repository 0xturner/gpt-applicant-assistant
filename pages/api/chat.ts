import { ipRateLimit } from "@lib/ip-rate-limit";
import { NextResponse } from "next/server";

import { z } from "zod";

import { mockStream } from "utils/mockStream";
import { tokenizeMessages } from "utils/openAI";
import {
  ChatGPTMessage,
  OpenAIStream,
  OpenAIStreamPayload,
} from "utils/OpenAIStream";
import { Configuration, OpenAIApi } from "openai";
import fetchAdapter from "@vespaiach/axios-fetch-adapter";

const LIVE_API = false;
const INPUT_TOKEN_LIMIT = 800;

const schema = z.object({
  resume: z.string(), // todo add char limit
  jobDescription: z.string(), // todo add char limit
});

type Body = z.infer<typeof schema>;

// break the app if the API key is missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing Environment Variable OPENAI_API_KEY");
}

export const config = {
  runtime: "edge", // TODO should we even be using edge?
};

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

// TODO
// jest test (or vitest??)
// mock ipRateLimit
// mock create moderation (MSW??)
// organize

const handler = async (req: Request, res: Response): Promise<Response> => {
  const body = schema.parse(await req.json()); // todo test response if parse fails

  const messages = getMessages(body);
  const tokens = tokenizeMessages(messages);

  // Moderate the content to comply with OpenAI T&C
  const moderationRes = await openai.createModeration(
    {
      input: body.resume + " " + body.jobDescription,
    },
    {
      adapter: fetchAdapter,
    }
  );

  if (moderationRes.data.results[0].flagged) {
    return new NextResponse(null, {
      status: 400,
      statusText: "flagged content",
    });
  }

  if (tokens.length > INPUT_TOKEN_LIMIT) {
    return new NextResponse(null, {
      status: 400,
      statusText: "exceeds token limit",
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

const getMessages = (body: Body): ChatGPTMessage[] => [
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
