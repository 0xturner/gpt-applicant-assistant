const MOCK_RESPONSE =
  "Dear Hiring Manager,\n\nI am excited to apply for the Senior Software Engineer position at [Company Name]. As a product-minded software engineer with experience building and scaling front-end and back-end systems, I am confident that I have the skills and expertise to contribute to your mission of empowering every developer to build accessible and scalable omnichain applications.\n\nIn my previous role as a Senior Software Engineer at Fraction, I helped build the foundational codebase and grew the team for a next-gen finance platform. I also architected the payment operations platform, which included automated money movement, bank integration, reconciliation, reporting, and more. My experience in building full-stack product features in a distributed serverless environment and executing hiring initiatives will be valuable in contributing to your team's success.\n\nI am inspired by [Company Name]'s mission to enable every individual to access web3 with no friction. Your values of First Principles Thinking, Ownership, Customer Focus, and Urgency align with my own values and work ethic. I am excited to work with a team that is not bound by conventional thinking and is obsessed with delivering the future as fast as possible while being intentional.\n\nThank you for considering my application. I look forward to the opportunity to discuss my qualifications further.\n\nSincerely,\n[Your Name]";

const MOCK_RESPONSE_ARRAY = MOCK_RESPONSE.split(" ");

export async function mockStream() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of MOCK_RESPONSE_ARRAY as any) {
        // artifically delay the stream
        await new Promise((resolve) =>
          setTimeout(() => {
            resolve("done");
          }, 10)
        );
        const queue = encoder.encode(chunk);
        controller.enqueue(queue);
      }

      controller.close();
    },
  });

  return stream;
}
