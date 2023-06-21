import * as z from "zod";

const isInvalidTypeIssue = (err: any): err is z.ZodInvalidTypeIssue =>
  "received" in err && "expected" in err;
const isInvalidUnionIssue = (err: any): err is z.ZodInvalidUnionIssue =>
  "unionErrors" in err;

export const formatZodError = (error: z.ZodError): string => {
  const issues = error.issues
    .flatMap((i) =>
      isInvalidUnionIssue(i)
        ? [i, ...i.unionErrors.flatMap((ui) => ui.issues)]
        : [i]
    )
    // @ts-ignore - There should be a keys property. Map it all to path though
    .map((i) => ({ ...i, path: i.path ?? i.keys }))
    .filter((i) => !!i.path?.[0]);
  if (issues.length === 0) {
    return "ZodError with no useable issues (somehow)";
  }

  const formattedIssues = issues.map(
    (i) =>
      `${i.path?.join(".")}: ${i.message} [${i.code}]` +
      `${
        isInvalidTypeIssue(i)
          ? ` (expected: ${i.expected}, received: ${i.received})`
          : ""
      }`
  );

  return formattedIssues.join("; ");
};
