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
//import { createOpenAI } from "@inkeep/openai";
const core_1 = require("@urql/core");
const ai_1 = require("ai");
const schemas_js_1 = require("./schemas.js");
const logToInkeepAnalytics_1 = require("./logToInkeepAnalytics");
dotenv.config();
const graphqlClient = new core_1.Client({
    url: process.env.GRAPHQL_ENDPOINT ?? (() => { throw new Error("GRAPHQL_ENDPOINT environment variable is not set"); })(),
    exchanges: [core_1.cacheExchange, core_1.fetchExchange],
    fetchOptions: () => ({
        headers: {
            'Authorization': `Bearer ${process.env.GRAPHQL_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
    }),
});
async function fetchIntegrationApiKey(installationId) {
    // Ensure we have an admin-level GraphQL token configured
    const adminToken = process.env.INKEEP_GRAPHQL_ADMIN_TOKEN;
    if (!adminToken) {
        throw new Error('Missing INKEEP_GRAPHQL_ADMIN_TOKEN environment variable');
    }
    // Execute the query with the admin token in the Authorization header
    const response = await graphqlClient
        .query(GET_GITHUB_APP_INTEGRATION_SETTINGS, { installationId: installationId.toString() }, {
        // Override fetchOptions per request
        fetchOptions: {
            headers: {
                Authorization: `Bearer ${adminToken}`,
            },
        },
    })
        .toPromise();
    //   // Handle GraphQL authorization errors explicitly
    if (response.error) {
        const graphQLError = response.error.graphQLErrors?.[0]?.message;
        if (graphQLError?.includes('Not authorized')) {
            console.error('🚫 Unauthorized: check INKEEP_GRAPHQL_ADMIN_TOKEN permissions');
            throw new Error('GraphQL unauthorized: insufficient permissions');
        }
        console.error('Error fetching integration settings:', response.error);
        throw new Error(response.error.message);
    }
    const apiKey = response.data?.gitHubAppIntegrationSettings?.integration?.apiKey;
    if (!apiKey) {
        throw new Error('API key not found in GraphQL response');
    }
    return apiKey;
}
const GET_GITHUB_APP_INTEGRATION_SETTINGS = `
  query GetGitHubAppIntegrationSettings($installationId: ID!) {
    gitHubAppIntegrationSettings(input: { installationId: $installationId }) {
      integration {
        apiKey
      }
    }
  }
`;
// const GET_USER_BY_INSTALLATION_ID = `
//   query GetUserByInstallationId($installationId: ID!) {
//     userByInstallationId(installationId: $installationId) {
//       id
//       userId
//       email
//       username
//       organizationId
//       plan
//       createdAt
//       updatedAt
//     }
//   }
// `;
// const GET_ORGANIZATION_SETTINGS = `
//   query GetOrganizationSettings($organizationId: ID!) {
//     organization(id: $organizationId) {
//       id
//       name
//     }
//   }
// `;
// interface UserData {
//   id: string;
//   userId: string;
//   email?: string;
//   username?: string;
//   organizationId?: string;
//   plan: string;
//   createdAt: string;
//   updatedAt: string;
// }
// interface OrganizationData {
//   id: string;
//   name: string;
// }
// async function fetchUserByInstallationId(installationId: number): Promise<UserData | null> {
//   try {
//     console.log(`🔍 Fetching user data for installation ID: ${installationId}`);
//     const result = await graphqlClient.query(GET_USER_BY_INSTALLATION_ID, {
//       installationId: installationId.toString()
//     }).toPromise();
//     if (result.error) {
//       console.error('GraphQL query error:', result.error);
//       return null;
//     }
//     const userData = result.data?.userByInstallationId;
//     if (userData) {
//       console.log(`✅ Found user data for installation ${installationId}: ${userData.username || userData.userId}`);
//       return userData;
//     }
//     console.log(`❌ No user found for installation ID: ${installationId}`);
//     return null;
//   } catch (error) {
//     console.error(`❌ Failed to fetch user data for installation ${installationId}:`, error);
//     return null;
//   }
// }
// // Helper function to fetch organization settings
// async function fetchOrganizationSettings(organizationId: string): Promise<OrganizationData | null> {
//   try {
//     console.log(`🔍 Fetching organization settings for: ${organizationId}`);
//     const result = await graphqlClient.query(GET_ORGANIZATION_SETTINGS, {
//       organizationId
//     }).toPromise();
//     if (result.error) {
//       console.error('GraphQL query error:', result.error);
//       return null;
//     }
//     return result.data?.organization || null;
//   } catch (error) {
//     console.error(`❌ Failed to fetch organization settings for ${organizationId}:`, error);
//     return null;
//   }
// }
exports.default = (app) => {
    // const inkeepModel = 'inkeep-qa-expert';
    // const openai = createOpenAI({
    //   apiKey: process.env.INKEEP_API_KEY,
    //   baseURL: 'https://api.inkeep.com/v1'
    // });
    // Dashboard-driven confidence filter: 'all' | 'somewhat_confident' | 'very_confident'
    const confidenceFilter = 'very_confident';
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
        let issueNumber;
        try {
            // 1) Only proceed if this payload contains an issue
            if (!('issue' in context.payload)) {
                console.error("❌ Event payload does not contain an 'issue' property.");
                return;
            }
            // 2) Extract & normalize issue data
            const installationId = context.payload.installation?.id;
            console.log(`🔍 PROCESSING issue #${context.payload.issue.number} for installation ID ${installationId}`);
            const { title, body, number, user } = context.payload.issue;
            issueNumber = number;
            const fullQuestion = `${title ?? ''}\n\n${body ?? ''}`;
            console.log(`📝 Issue #${number} received: "${title}"`);
            if (installationId === undefined) {
                throw new Error("Installation ID is undefined in the event payload.");
            }
            const inkeepApiKey = await fetchIntegrationApiKey(installationId);
            const inkeepModel = 'inkeep-qa-expert';
            const openai = (0, openai_1.createOpenAI)({
                apiKey: inkeepApiKey,
                baseURL: 'https://api.inkeep.com/v1'
            });
            // Fallback to environment variable if no user data found
            // 3) Initialize analytics data
            const messagesToLogToAnalytics = [];
            const issueProperties = {
                issueId: number,
                //issueTitle: title,
                //repository: context.payload.repository?.full_name,
                issueUrl: context.payload.issue.html_url,
            };
            const userProperties = {
                userId: user?.login,
                additionalProperties: {}
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
            // 7) Extract source links
            const links = toolCalls.find(tc => tc.toolName === 'provideLinks')?.args;
            let sourcesSection = '';
            if (links?.links && Array.isArray(links.links) && links.links.length > 0) {
                sourcesSection = `

📚 **Sources:**
${links.links.map((link, index) => `${index + 1}. [${link.title || link.url}](${link.url})`).join('\n')}`;
            }
            // 8) Determine whether to respond based on dashboard filter
            let shouldRespond;
            shouldRespond = confidence === 'very_confident';
            if (!shouldRespond) {
                console.log(`🔇 Skipping issue #${number}: confidence='${confidence}', filter='${confidenceFilter}'`);
                messagesToLogToAnalytics.push({ content: `AI had ${confidence} confidence; no reply posted.`, role: 'assistant' });
                await (0, logToInkeepAnalytics_1.logToInkeepAnalytics)({
                    messagesToLogToAnalytics: messagesToLogToAnalytics,
                    properties: { ...issueProperties, responseGenerated: false, confidenceLevel: confidence, explanation },
                    userProperties: userProperties,
                    aiProvidedLinks: (links?.links || []).map((l) => ({
                        url: l.url,
                        title: l.title ?? undefined
                    })),
                });
                return;
            }
            // 9) Build the response comment
            let commentBody = `Here's a suggested solution:

${text}`;
            // Add sources if available
            if (sourcesSection) {
                commentBody += sourcesSection;
            }
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
            // 10) Post the comment (respect preview flag)
            if (process.env.PREVIEW !== 'false') {
                await context.octokit.issues.createComment(context.issue({ body: commentBody }));
                console.log(`✅ Responded to issue #${number} with confidence '${confidence}'`);
            }
            // 11) Log the assistant's reply to analytics
            messagesToLogToAnalytics.push({ content: text, role: 'assistant' });
            await (0, logToInkeepAnalytics_1.logToInkeepAnalytics)({
                messagesToLogToAnalytics: messagesToLogToAnalytics,
                properties: { ...issueProperties, responseGenerated: true, confidenceLevel: confidence, explanation, commentPosted: true },
                userProperties: userProperties,
                aiProvidedLinks: (links?.links || []).map((l) => ({
                    url: l.url,
                    title: l.title ?? undefined
                })),
            });
        }
        catch (err) {
            console.error(`❌ Failed to handle issue #${issueNumber ?? '(unknown)'}:`, err.message);
            console.error(err.stack);
            if (issueNumber) {
                try {
                    await (0, logToInkeepAnalytics_1.logToInkeepAnalytics)({
                        messagesToLogToAnalytics: [
                            { content: `Error processing issue: ${err.message}`, role: 'assistant' }
                        ],
                        properties: {
                            issueId: issueNumber,
                            responseGenerated: false,
                            error: err.message
                        },
                        userProperties: {
                            userId: 'unknown',
                            additionalProperties: {} // ← must include this
                        },
                        aiProvidedLinks: [],
                    });
                }
                catch (analyticsErr) {
                    console.error('Failed to log error to analytics:', analyticsErr);
                }
            }
        }
    });
    // Handler for new comments on issues
    //   app.on("issue_comment.created", async (context: Context<"issue_comment.created">) => {
    //     // 1) Only proceed if this comment mentions the bot
    //     console.log("🔍 Checking for bot mention in comment...");
    //     const BOT = process.env.BOT_USERNAME || "issue-resolver[bot]";
    //     const commentBody = context.payload.comment?.body ?? "";
    //     const installationId = context.payload.installation?.id;
    //     console.log(`🔍 PROCESSING comment for installation ID ${installationId}`);
    //     if (!commentBody.includes(`@${BOT}`)) {
    //       return;
    //     }
    //     // 2) Verify payload contains an issue
    //     if (!('issue' in context.payload)) {
    //       console.error("❌ Event payload does not contain an 'issue' property.");
    //       return;
    //     }
    //     // 3) Extract comment and repo context
    //     const { issue, repository, sender } = context.payload;
    //     const issueNumber = issue.number;
    //     const owner = repository.owner.login;
    //     const repo = repository.name;
    //     // 4) Fetch the entire comment thread for context
    //     console.log(`🔄 Fetching all comments for issue #${issueNumber}...`);
    //     const allCommentsResponse = await context.octokit.issues.listComments({ owner, repo, issue_number: issueNumber });
    //     const threadMessages = allCommentsResponse.data.map(c => ({
    //       role: c.user && c.user.type === 'Bot' ? 'assistant' as 'assistant' : 'user' as 'user',
    //       content: c.body ?? ''
    //     }));
    //     console.log(`📝 Retrieved ${threadMessages.length} comment(s) from the thread.`);
    //     // 5) Log the new mention to analytics
    //     const messagesToLog: Messages[] = [{ content: commentBody, role: 'user' }];
    //     const issueProps = { issueId: issueNumber, issueTitle: issue.title, repository: repository.full_name, issueUrl: issue.html_url };
    //     const userProps = { userId: sender.id.toString(), additionalProperties: { username: sender.login, email: sender.email || null, githubUrl: sender.html_url, userType: sender.type } };
    //     // Declare commentLinksForAnalytics as empty before first use
    //     const commentLinksForAnalytics: { links?: any[] } = {};
    //     await logToInkeepAnalytics({ 
    //       messagesToLogToAnalytics: messagesToLog, 
    //       properties: { ...issueProps, responseGenerated: false }, 
    //       userProperties: userProps, 
    //       aiProvidedLinks: (commentLinksForAnalytics?.links || []).map((l: any) => ({
    //         url: l.url,
    //         title: l.title ?? undefined
    //       }))
    //     });
    //     // 6) Call the QA routine with full thread context
    //      if (installationId === undefined) {
    //     throw new Error("Installation ID is undefined in the event payload.");
    //   }
    //   // const inkeepApiKey = await fetchIntegrationApiKey(installationId);
    //   // const inkeepModel = 'inkeep-qa-expert';
    //   // const openai = createOpenAI({
    //   //     apiKey: inkeepApiKey,
    //   //     baseURL: 'https://api.inkeep.com/v1'
    //   //   });
    //     console.log("💬 Generating response with full thread context...");
    //     const { text, toolCalls } = await generateText({
    //       model: openai(inkeepModel),
    //       messages: [{ role: 'system', content: systemPrompt }, ...threadMessages, { role: 'user', content: commentBody }],
    //       tools: { provideAIAnnotations: { parameters: ProvideAIAnnotationsToolSchema }, provideLinks: { parameters: ProvideLinksToolSchema } },
    //       toolChoice: 'auto'
    //     });
    //     // 7) Extract AI annotations (confidence & explanation)
    //     const aiAnn = toolCalls.find(tc => tc.toolName === 'provideAIAnnotations')?.args.aiAnnotations;
    //     const confidence = aiAnn?.answerConfidence ?? 'unknown';
    //     const explanation = aiAnn?.explanation ?? '';
    //     console.log(`🎯 Comment on issue #${issueNumber} confidence level: ${confidence}`);
    //     // 8) Extract source links for comments
    //     const commentLinks = toolCalls.find(tc => tc.toolName === 'provideLinks')?.args;
    //     let commentSourcesSection = '';
    //     if (commentLinks?.links && commentLinks.links.length > 0) {
    //       commentSourcesSection = `
    // 📚 **Sources:**
    // ${commentLinks.links.map((link: any, index: number) => `${index + 1}. [${link.title || link.url}](${link.url})`).join('\n')}`;
    //     }
    //     // 9) Determine whether to respond based on dashboard filter
    //     let shouldRespondComment: boolean;
    //     shouldRespondComment = true
    //     if (!shouldRespondComment) {
    //       console.log(`🔇 Skipping reply on issue #${issueNumber}: confidence='${confidence}', filter='${confidenceFilter}'`);
    //       messagesToLog.push({ content: `AI had ${confidence} confidence; no reply posted.`, role: 'assistant' });
    //       await logToInkeepAnalytics({
    //         messagesToLogToAnalytics: messagesToLog,
    //         properties: { ...issueProps, responseGenerated: false, confidenceLevel: confidence, explanation },
    //         userProperties: userProps,
    //         aiProvidedLinks: (commentLinks?.links || []).map((l: any) => ({
    //           url: l.url,
    //           title: l.title ?? undefined
    //         })),
    //       });
    //       return;
    //     }
    //     // 10) Build the reply comment
    //     let replyBody = `🤖 ${text}`;
    //     // Add sources if available
    //     if (commentSourcesSection) {
    //       replyBody += commentSourcesSection;
    //     }
    //     if (confidence === 'very_confident') replyBody += `
    // ✅ _High confidence response_`;
    //     else if (confidence === 'somewhat_confident') replyBody += `
    // ⚠️ _Somewhat confident; please verify correctness._`;
    //     if (explanation) replyBody += `
    // 💡 _${explanation}_`;
    //     replyBody += `
    // ---
    // _This response was generated by an AI assistant. Please verify it works for your use case._`;
    //     // 11) Post the reply comment
    //     await context.octokit.issues.createComment(context.issue({ body: replyBody }));
    //     console.log(`✅ Replied on issue #${issueNumber} with confidence='${confidence}'`);
    //     // 12) Log assistant's reply to analytics
    //     messagesToLog.push({ content: text, role: 'assistant' });
    //     await logToInkeepAnalytics({
    //       messagesToLogToAnalytics: messagesToLog,
    //       properties: { ...issueProps, responseGenerated: true, confidenceLevel: confidence, explanation, commentPosted: true },
    //       userProperties: userProps,
    //       aiProvidedLinks: (commentLinks?.links || []).map((l: any) => ({
    //         url: l.url,
    //         title: l.title ?? undefined
    //       })),
    //     });
    //   });
    // };
    // Updated comment handler section in index.ts
    app.on("issue_comment.created", async (context) => {
        let issueNumber;
        try {
            console.log("🔍 Checking for bot mention in comment...");
            const BOT = process.env.BOT_USERNAME || "issue-resolver[bot]";
            const commentBody = context.payload.comment?.body ?? "";
            issueNumber = context.payload.issue?.number;
            if (!commentBody.includes(`@${BOT}`)) {
                console.log("❌ No bot mention found, skipping...");
                return;
            }
            const { issue, repository, sender } = context.payload;
            const owner = repository.owner.login;
            const repo = repository.name;
            console.log(`🔄 Fetching full thread for issue #${issue.number}...`);
            // Fetch the entire comment thread for context
            const allComments = await context.octokit.issues.listComments({
                owner,
                repo,
                issue_number: issue.number
            });
            // Build the complete thread including the original issue
            const fullThreadMessages = [
                // Original issue as first message
                {
                    role: 'user',
                    message: `${issue.title}\n\n${issue.body || ''}`,
                    user: issue.user?.login || 'unknown'
                },
                // All comments in chronological order
                ...allComments.data.map(comment => ({
                    role: (comment.user && comment.user.type === 'Bot' ? 'assistant' : 'user'),
                    message: comment.body || '',
                    user: comment.user?.login || 'unknown'
                }))
            ];
            // Create thread history context in the same format as Slack/Discord
            const threadHistoryContext = `<THREAD_MESSAGE_HISTORY>
${JSON.stringify(fullThreadMessages)}
</THREAD_MESSAGE_HISTORY>`;
            console.log(`📝 Built full thread with ${fullThreadMessages.length} messages (1 issue + ${allComments.data.length} comments)`);
            // Prepare user message content with thread context
            // const userMessageContentItemArray = [
            //   {
            //     type: 'text',
            //     text: threadHistoryContext,
            //   },
            //   {
            //     type: 'text', 
            //     text: commentBody
            //   }
            // ];
            // Prepare analytics properties with thread context
            const issueProps = {
                issueId: issue.number,
                //issueTitle: issue.title, 
                //repository: repository.full_name, 
                issueUrl: issue.html_url,
            };
            const userProps = {
                userId: sender.id.toString(),
                additionalProperties: {
                //username: sender.login, 
                //email: sender.email || null, 
                //githubUrl: sender.html_url, 
                //userType: sender.type 
                }
            };
            const installationId = context.payload.installation?.id;
            if (installationId === undefined) {
                throw new Error("Installation ID is undefined in the event payload.");
            }
            const inkeepApiKey = await fetchIntegrationApiKey(installationId);
            const inkeepModel = 'inkeep-qa-expert';
            const openai = (0, openai_1.createOpenAI)({
                apiKey: inkeepApiKey,
                baseURL: 'https://api.inkeep.com/v1'
            });
            // Generate AI response using thread context
            const { text, toolCalls } = await (0, ai_1.generateText)({
                model: openai(inkeepModel),
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: threadHistoryContext },
                    { role: 'user', content: commentBody }
                ],
                tools: {
                    provideAIAnnotations: { parameters: schemas_js_1.ProvideAIAnnotationsToolSchema },
                    provideLinks: { parameters: schemas_js_1.ProvideLinksToolSchema }
                },
                toolChoice: 'auto'
            });
            // Extract AI annotations and links
            const aiAnnotations = toolCalls.find(tc => tc.toolName === 'provideAIAnnotations')?.args.aiAnnotations;
            const confidence = aiAnnotations?.answerConfidence ?? 'unknown';
            const explanation = aiAnnotations?.explanation ?? '';
            const links = toolCalls.find(tc => tc.toolName === 'provideLinks')?.args;
            console.log(`🎯 Comment on issue #${issue.number} confidence level: ${confidence}`);
            // Build reply comment
            let reply = `🤖 ${text}`;
            if (links?.links?.length) {
                reply += `\n\n📚 **Sources:**\n${links.links.map((l, i) => `${i + 1}. [${l.title || l.url}](${l.url})`).join('\n')}`;
            }
            if (confidence === 'very_confident') {
                reply += `\n\n✅ _High confidence response_`;
            }
            else if (confidence === 'somewhat_confident') {
                reply += `\n\n⚠️ _Somewhat confident; please verify correctness._`;
            }
            if (explanation) {
                reply += `\n\n💡 _${explanation}_`;
            }
            reply += `\n\n---\n_This response was generated by an AI assistant. Please verify it works for your use case._`;
            // Post the reply comment (respect preview flag)
            if (process.env.PREVIEW !== 'false') {
                await context.octokit.issues.createComment(context.issue({ body: reply }));
                console.log(`✅ Replied to issue #${issue.number} with confidence '${confidence}'`);
            }
            // Log the ENTIRE THREAD plus the new bot response to analytics
            // Convert to the Messages format expected by logToInkeepAnalytics
            const messagesToLogToAnalytics = [
                {
                    role: 'user', content: [
                        { type: 'text', text: threadHistoryContext },
                        { type: 'text', text: commentBody }
                    ]
                },
                { role: 'assistant', content: text }
            ];
            console.log(`📊 Logging ${messagesToLogToAnalytics.length} messages to analytics...`);
            await (0, logToInkeepAnalytics_1.logToInkeepAnalytics)({
                messagesToLogToAnalytics: messagesToLogToAnalytics,
                properties: {
                    ...issueProps,
                    //responseGenerated: true,
                    confidenceLevel: confidence,
                    //explanation,
                    commentPosted: process.env.PREVIEW !== 'false'
                },
                userProperties: userProps,
                aiProvidedLinks: links?.links?.map((l) => ({
                    url: l.url,
                    title: l.title
                })) || []
            });
            console.log(`✅ Analytics logged for comment thread on issue #${issue.number}`);
        }
        catch (err) {
            console.error(`❌ Error handling comment on issue #${issueNumber}:`, err);
            if (issueNumber) {
                try {
                    await (0, logToInkeepAnalytics_1.logToInkeepAnalytics)({
                        messagesToLogToAnalytics: [
                            { content: `Error processing comment: ${err.message}`, role: 'assistant' }
                        ],
                        properties: {
                            issueId: issueNumber,
                            responseGenerated: false,
                            error: err.message,
                            triggerType: 'bot_mention_in_comment'
                        },
                        userProperties: {
                            userId: 'unknown',
                            additionalProperties: {}
                        },
                        aiProvidedLinks: []
                    });
                }
                catch (analyticsErr) {
                    console.error('❌ Failed to log error to analytics:', analyticsErr);
                }
            }
        }
    });
};
//# sourceMappingURL=index.js.map