"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyIssueWithInkeep = classifyIssueWithInkeep;
const zod_1 = require("zod");
const TriageResultSchema = zod_1.z.enum(["respond", "defer", "unsure"]);
async function classifyIssueWithInkeep(issueTitle, issueBody) {
    const apiKey = process.env.INKEEP_API_KEY;
    const endpoint = "https://api.inkeep.com/v1/chat/completions";
    const question = `${issueTitle}\n\n${issueBody}`;
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "inkeep-qa-expert",
            messages: [
                {
                    role: "system",
                    content: "You are an AI assistant for the Drizzle ORM open source project. Help users with documentation and usage issues and decide whether a GitHub issue is appropriate for an AI response by the drizzle Inkeep AI.",
                },
                {
                    role: "user",
                    content: `Here's a GitHub issue:\n\n${question}\n\nShould Inkeep respond? Reply with one of:\n- 'respond' (should answer)\n- 'defer' (not related to Inkeep)\n- 'unsure' (cannot determine)`,
                },
            ],
        }),
    });
    const json = await response.json();
    const content = json.choices?.[0]?.message?.content?.trim().toLowerCase();
    if (!TriageResultSchema.safeParse(content).success) {
        console.warn("Unrecognized triage result:", content);
        return "unsure";
    }
    return content;
}
//# sourceMappingURL=triageClassifier.js.map