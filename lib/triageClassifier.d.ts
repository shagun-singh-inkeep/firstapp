import { z } from "zod";
declare const TriageResultSchema: z.ZodEnum<["respond", "defer", "unsure"]>;
export type TriageDecision = z.infer<typeof TriageResultSchema>;
export declare function classifyIssueWithInkeep(issueTitle: string, issueBody: string): Promise<TriageDecision>;
export {};
