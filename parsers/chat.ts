import { z } from "zod";

export const chatRequest = z.object({
  resume: z.string().trim().min(10).max(500),
  jobDescription: z.string().trim().min(10).max(500),
});

export type ChatRequest = z.infer<typeof chatRequest>;
