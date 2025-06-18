"use strict";
// import { Probot } from "probot";
// import * as dotenv from "dotenv";
// import queryInkeepQA from "./inkeepClient.js";
// import { classifyIssueWithInkeep } from "./triageClassifier.js";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const openai_1 = require("@ai-sdk/openai");
const ai_1 = require("ai");
const schemas_js_1 = require("./schemas.js");
const logToInkeepAnalytics_1 = require("./logToInkeepAnalytics");
dotenv.config();
exports.default = (app) => {
    const inkeepModel = 'inkeep-qa-expert';
    const openai = (0, openai_1.createOpenAI)({
        apiKey: process.env.INKEEP_API_KEY,
        baseURL: 'https://api.inkeep.com/v1'
    });
    const systemPrompt = `
You are a helpful AI assistant responding to GitHub issues. Your goal is to provide accurate, helpful answers based on available documentation and knowledge sources.

- Be direct and concise in your responses
- Focus on providing actionable solutions
- If you're not confident about an answer, indicate your uncertainty
- Use a natural, helpful tone without being overly formal
- Avoid phrases like "According to the documentation" - just state facts directly
`;
    app.on(["issues.opened", "issues.reopened"], async (context) => {
        // Make number available in catch scope
        let issueNumber = undefined;
        try {
            if (!('issue' in context.payload)) {
                console.error("❌ Event payload does not contain an 'issue' property.");
                return;
            }
            const { title, body, number, user } = context.payload.issue;
            issueNumber = number;
            const safeTitle = title ?? "";
            const safeBody = body ?? "";
            const fullQuestion = `${safeTitle}\n\n${safeBody}`;
            console.log(`📝 Issue #${number} received: "${safeTitle}"`);
            // Initialize analytics data
            const messagesToLogToAnalytics = [];
            const issueProperties = {
                issueId: number,
                issueTitle: safeTitle,
                repository: context.payload.repository?.full_name,
                issueUrl: context.payload.issue.html_url,
            };
            const userProperties = {
                userId: user?.id?.toString() || 'unknown',
                additionalProperties: {
                    username: user?.login,
                    email: user?.email || null,
                    githubUrl: user?.html_url,
                    userType: user?.type,
                },
            };
            // Log the user's question
            messagesToLogToAnalytics.push({
                content: fullQuestion,
                role: 'user',
            });
            // Prepare messages with system prompt
            const messages = [
                { id: "system-1", role: "system", content: systemPrompt },
                { id: "user-1", role: "user", content: fullQuestion }
            ];
            // Call Inkeep model with AI tools
            const { text, toolCalls } = await (0, ai_1.generateText)({
                model: openai(inkeepModel),
                messages,
                tools: {
                    provideAIAnnotations: {
                        parameters: schemas_js_1.ProvideAIAnnotationsToolSchema
                    },
                    provideLinks: {
                        parameters: schemas_js_1.ProvideLinksToolSchema
                    }
                },
                toolChoice: 'auto'
            });
            // Extract AI annotations (confidence level)
            const aiAnnotations = toolCalls.find(tc => tc.toolName === 'provideAIAnnotations')
                ?.args.aiAnnotations;
            const confidence = aiAnnotations?.answerConfidence ?? 'unknown';
            const explanation = aiAnnotations?.explanation ?? '';
            console.log(`🎯 Issue #${number} confidence level: ${confidence}`);
            // Only respond if confidence is high enough (matching Zendesk logic)
            const shouldRespond = confidence === 'very_confident';
            if (!shouldRespond) {
                console.log(`🔇 Skipping issue #${number}: confidence level '${confidence}' below threshold`);
                // Log the low confidence response to analytics
                const confidenceNote = `AI Agent had ${confidence} confidence level in its answer: ${text}`;
                messagesToLogToAnalytics.push({
                    content: confidenceNote,
                    role: 'assistant',
                });
                // Log to Inkeep Analytics
                await (0, logToInkeepAnalytics_1.logToInkeepAnalytics)({
                    messagesToLogToAnalytics,
                    properties: {
                        ...issueProperties,
                        responseGenerated: false,
                        confidenceLevel: confidence,
                        explanation,
                    },
                    userProperties,
                });
                // Optionally add a subtle note for somewhat_confident cases
                if (confidence === 'somewhat_confident') {
                    console.log(`💭 Issue #${number} was somewhat confident but below response threshold`);
                }
                return;
            }
            // Build the response comment
            let commentBody = `🤖 Here's a suggested solution:\n\n${text}`;
            // Add confidence indicator
            if (confidence === 'very_confident') {
                commentBody += `\n\n✅ _High confidence response_`;
            }
            // Add explanation if provided
            if (explanation) {
                commentBody += `\n\n💡 _${explanation}_`;
            }
            commentBody += `\n\n---\n_This response was generated by an AI assistant. Please verify the solution works for your specific use case._`;
            // Post the comment
            await context.octokit.issues.createComment(context.issue({ body: commentBody }));
            console.log(`✅ Responded to issue #${number} with confidence '${confidence}'`);
            // Log the successful response to analytics
            messagesToLogToAnalytics.push({
                content: text, // Log the original AI response, not the formatted comment
                role: 'assistant',
            });
            // Log to Inkeep Analytics
            await (0, logToInkeepAnalytics_1.logToInkeepAnalytics)({
                messagesToLogToAnalytics,
                properties: {
                    ...issueProperties,
                    responseGenerated: true,
                    confidenceLevel: confidence,
                    explanation,
                    commentPosted: true,
                },
                userProperties,
            });
        }
        catch (err) {
            console.error(`❌ Failed to handle issue #${issueNumber ?? "(unknown)"}:`, err?.message);
            console.error(err?.stack);
            // Log error to analytics if we have the basic data
            if (issueNumber) {
                try {
                    await (0, logToInkeepAnalytics_1.logToInkeepAnalytics)({
                        messagesToLogToAnalytics: [{
                                content: `Error processing issue: ${err?.message}`,
                                role: 'assistant',
                            }],
                        properties: {
                            issueId: issueNumber,
                            error: err?.message,
                            responseGenerated: false,
                        },
                        userProperties: {
                            userId: 'unknown',
                        },
                    });
                }
                catch (analyticsErr) {
                    console.error('Failed to log error to analytics:', analyticsErr);
                }
            }
        }
    });
};
//# sourceMappingURL=index.js.map