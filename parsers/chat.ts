import { z } from "zod";

export const chatRequest = z.object({
  resume: z.string(), // todo add char min max
  jobDescription: z.string(), // todo add min max
});

export type ChatRequest = z.infer<typeof chatRequest>;
