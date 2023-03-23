import { z } from "zod";

export const chatRequest = z.object({
  resume: z.string().trim().min(10).max(2000),
  jobDescription: z.string().trim().min(10).max(2000),
});

export type ChatRequest = z.infer<typeof chatRequest>;
