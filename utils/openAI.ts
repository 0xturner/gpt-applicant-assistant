import GPT3Tokenizer from "gpt3-tokenizer";
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
