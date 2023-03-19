import { NextRequest, NextResponse } from "next/server";
import { ipRateLimit } from "@lib/ip-rate-limit";

import { Configuration, OpenAIApi } from "openai";
import fetchAdapter from "@vespaiach/axios-fetch-adapter";

const SAMPLE_RESPONSE =
  "Dear Hiring Manager,\n\nI am excited to apply for the Senior Software Engineer position at Orb Labs. As a product-minded software engineer with experience building and scaling front-end and back-end systems, I am confident that I have the skills and expertise to contribute to your mission of empowering every developer to build accessible and scalable omnichain applications.\n\nIn my previous role as a Senior Software Engineer at Fraction, I helped build the foundational codebase and grew the team for a next-gen finance platform. I also architected the payment operations platform, which included automated money movement, bank integration, reconciliation, reporting, and more. My experience in building full-stack product features in a distributed serverless environment and executing hiring initiatives will be valuable in contributing to your team's success.\n\nI am inspired by Orb Labs' mission to enable every individual to access web3 with no friction. Your values of First Principles Thinking, Ownership, Customer Focus, and Urgency align with my own values and work ethic. I am excited to work with a team that is not bound by conventional thinking and is obsessed with delivering the future as fast as possible while being intentional.\n\nThank you for considering my application. I look forward to the opportunity to discuss my qualifications further.\n\nSincerely,\n[Your Name]";

const ACTIVE = false;

// break the app if the API key is missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing Environment Variable OPENAI_API_KEY");
}

export const config = {
  runtime: "edge", // TODO should we even be using edge?
};

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const handler = async (req: NextRequest): Promise<Response> => {
  const res = await ipRateLimit(req);
  // If the status is not 200 then it has been rate limited.
  if (res.status !== 200) return res;

  const body = await req.json();
  // console.log("body: ", body);

  // TODO parse the body

  if (!ACTIVE) {
    return NextResponse.json(
      {
        text: SAMPLE_RESPONSE,
      },
      { headers: res.headers }
    );
  }

  const completion = await openai.createChatCompletion(
    {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that helps job applicants.",
        },
        {
          role: "user",
          content: `Write my cover letter for a job application in a conversational tone. Use my resume and the job description below as reference. \nResume:\n${body.resume}\nJob Description:\n${body.jobDescription}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 500,
    },
    {
      adapter: fetchAdapter,
    }
  );

  console.log("completion.data.choices: ", completion.data.choices);
  return NextResponse.json(
    {
      text: completion.data.choices[0].message?.content,
    },
    { headers: res.headers }
  );
};

export default handler;
