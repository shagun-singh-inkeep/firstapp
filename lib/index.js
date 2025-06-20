"use strict";
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
    // Dashboard-driven confidence filter: 'all' | 'somewhat_confident' | 'very_confident'
    const confidenceFilter = process.env.CONFIDENCE_FILTER || 'all';
    const systemPrompt = `
You are a helpful AI assistant responding to GitHub issues. Your goal is to provide accurate, helpful answers based on available documentation and knowledge sources.

- Be direct and concise in your responses
- Focus on providing actionable solutions
- If you're not confident about an answer, indicate your uncertainty
- Use a natural, helpful tone without being overly formal
- Avoid phrases like "According to the documentation" - just state facts directly
`;
    // Handler for new issues (opened/reopened)
    app.on(["issues.opened", "issues.reopened"], async (context) => {
        //  const { issue, repository } = context.payload;
        // Make number available in catch scope
        //   const { owner, repo } = context.repo();
        // const { issue } = context.payload;
        // // 1) build your normalized event
        // const e: HandleGitHubEvent = {
        //   repoId:         `${owner}/${repo}`,
        //   issueNum:       String(issue.number),
        //   specIssueId:    String(issue.id),
        //   messageUsername: issue.user.login,
        //   messageTitle:   issue.title,
        //   messageBody:    issue.body ?? "",
        //   say: async (msg: string) =>
        //     context.octokit.issues.createComment({
        //       owner,
        //       repo,
        //       issue_number: issue.number,
        //       body: msg,
        //     }),
        //   client: context.octokit,
        //   botId:  String(context.payload.installation?.id ?? "unknown"),
        // };
        let issueNumber;
        try {
            // 1) Only proceed if this payload contains an issue
            if (!('issue' in context.payload)) {
                console.error("❌ Event payload does not contain an 'issue' property.");
                return;
            }
            // 2) Extract & normalize issue data
            const { title, body, number, user } = context.payload.issue;
            issueNumber = number;
            const fullQuestion = `${title ?? ''}\n\n${body ?? ''}`;
            console.log(`📝 Issue #${number} received: "${title}"`);
            // 3) Initialize analytics data
            const messagesToLogToAnalytics = [];
            const issueProperties = {
                issueId: number,
                issueTitle: title,
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
                }
            };
            // 4) Log the user's question
            messagesToLogToAnalytics.push({ content: fullQuestion, role: 'user' });
            // 5) Call the QA routine
            const messages = [
                { id: 'system-1', role: 'system', content: systemPrompt },
                { id: 'user-1', role: 'user', content: fullQuestion }
            ];
            const { text, toolCalls } = await (0, ai_1.generateText)({
                model: openai(inkeepModel),
                messages,
                tools: {
                    provideAIAnnotations: { parameters: schemas_js_1.ProvideAIAnnotationsToolSchema },
                    provideLinks: { parameters: schemas_js_1.ProvideLinksToolSchema }
                },
                toolChoice: 'auto'
            });
            // 6) Extract AI annotations (confidence & explanation)
            const aiAnnotations = toolCalls.find(tc => tc.toolName === 'provideAIAnnotations')?.args.aiAnnotations;
            const confidence = aiAnnotations?.answerConfidence ?? 'unknown';
            const explanation = aiAnnotations?.explanation ?? '';
            console.log(`🎯 Issue #${number} confidence level: ${confidence}`);
            // 7) Determine whether to respond based on dashboard filter
            let shouldRespond;
            switch (confidenceFilter) {
                case 'very_confident':
                    shouldRespond = confidence === 'very_confident';
                    break;
                case 'somewhat_confident':
                    shouldRespond = confidence === 'very_confident' || confidence === 'somewhat_confident';
                    break;
                case 'all':
                default:
                    shouldRespond = true;
            }
            if (!shouldRespond) {
                console.log(`🔇 Skipping issue #${number}: confidence='${confidence}', filter='${confidenceFilter}'`);
                messagesToLogToAnalytics.push({ content: `AI had ${confidence} confidence; no reply posted.`, role: 'assistant' });
                await (0, logToInkeepAnalytics_1.logToInkeepAnalytics)({
                    messagesToLogToAnalytics: messagesToLogToAnalytics,
                    properties: { ...issueProperties, responseGenerated: false, confidenceLevel: confidence, explanation },
                    userProperties: userProperties,
                });
                return;
            }
            // 8) Build the response comment
            let commentBody = `🤖 Here's a suggested solution:

${text}`;
            if (confidence === 'very_confident') {
                commentBody += `

✅ _High confidence response_`;
            }
            else if (confidence === 'somewhat_confident') {
                commentBody += `

⚠️ _Somewhat confident; please verify correctness._`;
            }
            if (explanation) {
                commentBody += `

💡 _${explanation}_`;
            }
            commentBody += `

---
_This response was generated by an AI assistant. Please verify it works for your use case._`;
            // 9) Post the comment (respect preview flag)
            if (process.env.PREVIEW !== 'false') {
                await context.octokit.issues.createComment(context.issue({ body: commentBody }));
                console.log(`✅ Responded to issue #${number} with confidence '${confidence}'`);
            }
            // 10) Log the assistant’s reply to analytics
            messagesToLogToAnalytics.push({ content: text, role: 'assistant' });
            await (0, logToInkeepAnalytics_1.logToInkeepAnalytics)({
                messagesToLogToAnalytics: messagesToLogToAnalytics,
                properties: { ...issueProperties, responseGenerated: true, confidenceLevel: confidence, explanation, commentPosted: true },
                userProperties: userProperties,
            });
        }
        catch (err) {
            console.error(`❌ Failed to handle issue #${issueNumber ?? '(unknown)'}:`, err.message);
            console.error(err.stack);
            if (issueNumber) {
                try {
                    await (0, logToInkeepAnalytics_1.logToInkeepAnalytics)({
                        messagesToLogToAnalytics: [{ content: `Error processing issue: ${err.message}`, role: 'assistant' }],
                        properties: { issueId: issueNumber, responseGenerated: false, error: err.message },
                        userProperties: { userId: 'unknown' },
                    });
                }
                catch (analyticsErr) {
                    console.error('Failed to log error to analytics:', analyticsErr);
                }
            }
        }
    });
    // Handler for new comments on issues
    app.on("issue_comment.created", async (context) => {
        // 1) Only proceed if this comment mentions the bot
        console.log("🔍 Checking for bot mention in comment...");
        const BOT = process.env.BOT_USERNAME || "issue-resolver[bot]";
        const commentBody = context.payload.comment?.body ?? "";
        if (!commentBody.includes(`@${BOT}`)) {
            return;
        }
        // 2) Verify payload contains an issue
        if (!('issue' in context.payload)) {
            console.error("❌ Event payload does not contain an 'issue' property.");
            return;
        }
        // 3) Extract comment and repo context
        const { issue, repository, sender } = context.payload;
        const issueNumber = issue.number;
        const owner = repository.owner.login;
        const repo = repository.name;
        // 4) Fetch the entire comment thread for context
        console.log(`🔄 Fetching all comments for issue #${issueNumber}...`);
        const allCommentsResponse = await context.octokit.issues.listComments({ owner, repo, issue_number: issueNumber });
        const threadMessages = allCommentsResponse.data.map(c => ({
            role: c.user && c.user.type === 'Bot' ? 'assistant' : 'user',
            content: c.body ?? ''
        }));
        console.log(`📝 Retrieved ${threadMessages.length} comment(s) from the thread.`);
        // 5) Log the new mention to analytics
        const messagesToLog = [{ content: commentBody, role: 'user' }];
        const issueProps = { issueId: issueNumber, issueTitle: issue.title, repository: repository.full_name, issueUrl: issue.html_url };
        const userProps = { userId: sender.id.toString(), additionalProperties: { username: sender.login, email: sender.email || null, githubUrl: sender.html_url, userType: sender.type } };
        await (0, logToInkeepAnalytics_1.logToInkeepAnalytics)({ messagesToLogToAnalytics: messagesToLog, properties: { ...issueProps, responseGenerated: false }, userProperties: userProps });
        // 6) Call the QA routine with full thread context
        console.log("💬 Generating response with full thread context...");
        const { text, toolCalls } = await (0, ai_1.generateText)({
            model: openai(inkeepModel),
            messages: [{ role: 'system', content: systemPrompt }, ...threadMessages, { role: 'user', content: commentBody }],
            tools: { provideAIAnnotations: { parameters: schemas_js_1.ProvideAIAnnotationsToolSchema }, provideLinks: { parameters: schemas_js_1.ProvideLinksToolSchema } },
            toolChoice: 'auto'
        });
        // 7) Extract AI annotations (confidence & explanation)
        const aiAnn = toolCalls.find(tc => tc.toolName === 'provideAIAnnotations')?.args.aiAnnotations;
        const confidence = aiAnn?.answerConfidence ?? 'unknown';
        const explanation = aiAnn?.explanation ?? '';
        console.log(`🎯 Comment on issue #${issueNumber} confidence level: ${confidence}`);
        // 8) Determine whether to respond based on dashboard filter
        let shouldRespondComment;
        switch (confidenceFilter) {
            case 'very_confident':
                shouldRespondComment = confidence === 'very_confident';
                break;
            case 'somewhat_confident':
                shouldRespondComment = confidence === 'very_confident' || confidence === 'somewhat_confident';
                break;
            case 'all':
            default:
                shouldRespondComment = true;
        }
        if (!shouldRespondComment) {
            console.log(`🔇 Skipping reply on issue #${issueNumber}: confidence='${confidence}', filter='${confidenceFilter}'`);
            messagesToLog.push({ content: `AI had ${confidence} confidence; no reply posted.`, role: 'assistant' });
            await (0, logToInkeepAnalytics_1.logToInkeepAnalytics)({
                messagesToLogToAnalytics: messagesToLog,
                properties: { ...issueProps, responseGenerated: false, confidenceLevel: confidence, explanation },
                userProperties: userProps,
            });
            return;
        }
        // 9) Build the reply comment
        let replyBody = `🤖 ${text}`;
        if (confidence === 'very_confident')
            replyBody += `

✅ _High confidence response_`;
        else if (confidence === 'somewhat_confident')
            replyBody += `

⚠️ _Somewhat confident; please verify correctness._`;
        if (explanation)
            replyBody += `

💡 _${explanation}_`;
        replyBody += `

---
_This response was generated by an AI assistant. Please verify it works for your use case._`;
        // 10) Post the reply comment
        await context.octokit.issues.createComment(context.issue({ body: replyBody }));
        console.log(`✅ Replied on issue #${issueNumber} with confidence='${confidence}'`);
        // 11) Log assistant’s reply to analytics
        messagesToLog.push({ content: text, role: 'assistant' });
        await (0, logToInkeepAnalytics_1.logToInkeepAnalytics)({
            messagesToLogToAnalytics: messagesToLog,
            properties: { ...issueProps, responseGenerated: true, confidenceLevel: confidence, explanation, commentPosted: true },
            userProperties: userProps,
        });
    });
};
//# sourceMappingURL=index.js.map