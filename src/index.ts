import { Probot, Context } from "probot";
import * as dotenv from "dotenv";
import { createOpenAI } from "@ai-sdk/openai";
//import { createOpenAI } from "@inkeep/openai";
import { Client, cacheExchange, fetchExchange } from '@urql/core';
import { generateText } from "ai";
import {
  ProvideAIAnnotationsToolSchema,
  ProvideLinksToolSchema
} from "./schemas.js";
import type { Message } from "ai";
import type { Messages, UserProperties } from '@inkeep/inkeep-analytics/models/components';
import { logToInkeepAnalytics } from './logToInkeepAnalytics';

dotenv.config();
const graphqlClient = new Client({
  url: process.env.GRAPHQL_ENDPOINT ?? (() => { throw new Error("GRAPHQL_ENDPOINT environment variable is not set"); })(),
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => ({
    headers: {
      'Authorization': `Bearer ${process.env.GRAPHQL_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  }),
});
async function fetchIntegrationApiKey(installationId: number): Promise<string> {
  // Ensure we have an admin-level GraphQL token configured
  const adminToken = process.env.INKEEP_GRAPHQL_ADMIN_TOKEN;
  if (!adminToken) {
    throw new Error('Missing INKEEP_GRAPHQL_ADMIN_TOKEN environment variable');
  }

  // Execute the query with the admin token in the Authorization header
  const response = await graphqlClient
    .query(
      GET_GITHUB_APP_INTEGRATION_SETTINGS,
      { installationId: installationId.toString() },
      {
        // Override fetchOptions per request
        fetchOptions: {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        },
      }
    )
    .toPromise();

  // Handle GraphQL authorization errors explicitly
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

export default (app: Probot) => {
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
  app.on(["issues.opened", "issues.reopened"], async (context: Context) => {

    let issueNumber: number | undefined;
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
  const openai = createOpenAI({
      apiKey: inkeepApiKey,
      baseURL: 'https://api.inkeep.com/v1'
    });
      

      // Fallback to environment variable if no user data found
     

      // 3) Initialize analytics data
      const messagesToLogToAnalytics: Messages[] = [];
      const issueProperties = {
        issueId: number,
        issueTitle: title,
        repository: context.payload.repository?.full_name,
        issueUrl: context.payload.issue.html_url,
      };
      const userProperties: UserProperties = {
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
      const messages: Message[] = [
        { id: 'system-1', role: 'system', content: systemPrompt },
        { id: 'user-1', role: 'user', content: fullQuestion }
      ];
      const { text, toolCalls } = await generateText({
        model: openai(inkeepModel),
        messages,
        tools: {
          provideAIAnnotations: { parameters: ProvideAIAnnotationsToolSchema },
          provideLinks: { parameters: ProvideLinksToolSchema }
        },
        toolChoice: 'auto'
      });

      // 6) Extract AI annotations (confidence & explanation)
      const aiAnnotations = toolCalls.find(tc => tc.toolName === 'provideAIAnnotations')?.args.aiAnnotations;
      const confidence = aiAnnotations?.answerConfidence ?? 'unknown';
      const explanation = aiAnnotations?.explanation ?? '';
      console.log(`🎯 Issue #${number} confidence level: ${confidence}`);

      // 7) Determine whether to respond based on dashboard filter
      let shouldRespond: boolean;
      shouldRespond = confidence === 'very_confident';
      if (!shouldRespond) {
        console.log(`🔇 Skipping issue #${number}: confidence='${confidence}', filter='${confidenceFilter}'`);
        messagesToLogToAnalytics.push({ content: `AI had ${confidence} confidence; no reply posted.`, role: 'assistant' });
        await logToInkeepAnalytics({
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
      } else if (confidence === 'somewhat_confident') {
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
      await logToInkeepAnalytics({
        messagesToLogToAnalytics: messagesToLogToAnalytics,
        properties: { ...issueProperties, responseGenerated: true, confidenceLevel: confidence, explanation, commentPosted: true },
        userProperties: userProperties,
      });

    } catch (err: any) {
      console.error(`❌ Failed to handle issue #${issueNumber ?? '(unknown)'}:`, err.message);
      console.error(err.stack);
      if (issueNumber) {
        try {
          await logToInkeepAnalytics({                             // ← new required field
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
    additionalProperties: {}                           // ← must include this
  }
});
        } catch (analyticsErr) {
          console.error('Failed to log error to analytics:', analyticsErr);
        }
      }
    }
  });

  // Handler for new comments on issues
  app.on("issue_comment.created", async (context: Context<"issue_comment.created">) => {
    // 1) Only proceed if this comment mentions the bot
    console.log("🔍 Checking for bot mention in comment...");
    const BOT = process.env.BOT_USERNAME || "issue-resolver[bot]";
    const commentBody = context.payload.comment?.body ?? "";
    const installationId = context.payload.installation?.id;
    console.log(`🔍 PROCESSING comment for installation ID ${installationId}`);
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
      role: c.user && c.user.type === 'Bot' ? 'assistant' as 'assistant' : 'user' as 'user',
      content: c.body ?? ''
    }));
    console.log(`📝 Retrieved ${threadMessages.length} comment(s) from the thread.`);

    // 5) Log the new mention to analytics
    const messagesToLog: Messages[] = [{ content: commentBody, role: 'user' }];
    const issueProps = { issueId: issueNumber, issueTitle: issue.title, repository: repository.full_name, issueUrl: issue.html_url };
    const userProps = { userId: sender.id.toString(), additionalProperties: { username: sender.login, email: sender.email || null, githubUrl: sender.html_url, userType: sender.type } };
    await logToInkeepAnalytics({ messagesToLogToAnalytics: messagesToLog, properties: { ...issueProps, responseGenerated: false }, userProperties: userProps });

    // 6) Call the QA routine with full thread context
     if (installationId === undefined) {
    throw new Error("Installation ID is undefined in the event payload.");
  }
  const inkeepApiKey = await fetchIntegrationApiKey(installationId);
  const inkeepModel = 'inkeep-qa-expert';
  const openai = createOpenAI({
      apiKey: inkeepApiKey,
      baseURL: 'https://api.inkeep.com/v1'
    });
      
    console.log("💬 Generating response with full thread context...");
    const { text, toolCalls } = await generateText({
      model: openai(inkeepModel),
      messages: [{ role: 'system', content: systemPrompt }, ...threadMessages, { role: 'user', content: commentBody }],
      tools: { provideAIAnnotations: { parameters: ProvideAIAnnotationsToolSchema }, provideLinks: { parameters: ProvideLinksToolSchema } },
      toolChoice: 'auto'
    });

    // 7) Extract AI annotations (confidence & explanation)
    const aiAnn = toolCalls.find(tc => tc.toolName === 'provideAIAnnotations')?.args.aiAnnotations;
    const confidence = aiAnn?.answerConfidence ?? 'unknown';
    const explanation = aiAnn?.explanation ?? '';
    console.log(`🎯 Comment on issue #${issueNumber} confidence level: ${confidence}`);

    // 8) Determine whether to respond based on dashboard filter
    let shouldRespondComment: boolean;
    shouldRespondComment = true
    if (!shouldRespondComment) {
      console.log(`🔇 Skipping reply on issue #${issueNumber}: confidence='${confidence}', filter='${confidenceFilter}'`);
      messagesToLog.push({ content: `AI had ${confidence} confidence; no reply posted.`, role: 'assistant' });
      await logToInkeepAnalytics({
    
        messagesToLogToAnalytics: messagesToLog,
        properties: { ...issueProps, responseGenerated: false, confidenceLevel: confidence, explanation },
        userProperties: userProps,
      });
      return;
    }

    // 9) Build the reply comment
    let replyBody = `🤖 ${text}`;
    if (confidence === 'very_confident') replyBody += `

✅ _High confidence response_`;
    else if (confidence === 'somewhat_confident') replyBody += `

⚠️ _Somewhat confident; please verify correctness._`;
    if (explanation) replyBody += `

💡 _${explanation}_`;
    replyBody += `

---
_This response was generated by an AI assistant. Please verify it works for your use case._`;

    // 10) Post the reply comment
    await context.octokit.issues.createComment(context.issue({ body: replyBody }));
    console.log(`✅ Replied on issue #${issueNumber} with confidence='${confidence}'`);

    // 11) Log assistant’s reply to analytics
    messagesToLog.push({ content: text, role: 'assistant' });
    await logToInkeepAnalytics({
   
      messagesToLogToAnalytics: messagesToLog,
      properties: { ...issueProps, responseGenerated: true, confidenceLevel: confidence, explanation, commentPosted: true },
      userProperties: userProps,
    });
  });
};
