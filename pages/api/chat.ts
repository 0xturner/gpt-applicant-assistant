import { NextRequest, NextResponse } from "next/server";

import { Configuration, OpenAIApi } from "openai";
import fetchAdapter from "@vespaiach/axios-fetch-adapter";

const ACTIVE = false;

// break the app if the API key is missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing Environment Variable OPENAI_API_KEY");
}

export const config = {
  runtime: "edge",
};

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const handler = async (req: NextRequest): Promise<Response> => {
  const body = await req.json();

  if (!ACTIVE) {
    return NextResponse.json({
      text: "dummy response",
    });
  }

  const completion = await openai.createChatCompletion(
    {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Who won the world series in 2020?" },
      ],
      temperature: 0.2,
      max_tokens: 100,
    },
    {
      adapter: fetchAdapter,
    }
  );

  return NextResponse.json({
    text: completion.data.choices[0].message?.content,
  });
};

export default handler;
