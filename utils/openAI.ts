import fetchAdapter from "@vespaiach/axios-fetch-adapter";
import GPT3Tokenizer from "gpt3-tokenizer";
import { Configuration, OpenAIApi } from "openai";
import { ChatGPTMessage } from "./OpenAIStream";

export const tokenize = (str: string) => {
  const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
  const { text } = tokenizer.encode(str);
  return text;
};

export const tokenizeMessages = (messages: ChatGPTMessage[]) => {
  const text = messages.map(({ content }) => content).join(" ");
  return tokenize(text);
};

// Moderate content to comply with OpenAI T&C
export const moderateOpenAIText = async (input: string) => {
  const openai = new OpenAIApi(
    new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    })
  );

  const moderationRes = await openai.createModeration(
    {
      input,
    },
    {
      adapter: fetchAdapter, // TODO this might only be needed for edge-runtime, could possibly make optional
    }
  );

  if (moderationRes.data.results[0].flagged) {
    throw new Error("flagged content");
  }
};
