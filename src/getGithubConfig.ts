// import type { HandleGitHubEvent } from './githubDerivedTypes';
// import {  githubSettingsCache } from './getGithubConfig';
// import { GitHubAppType } from './githubDerivedTypes';

// export interface GitHubConfig {
//   apiKey: string;
//   previewEnabled: boolean;
// }

// export const getGithubConfig = async (
//   e: HandleGitHubEvent,
//   botWasMentioned: boolean
// ): Promise<GitHubConfig | undefined> => {
//   try {
//     // fetch the full integration settings for this repo
//     const fullConfig = await getGithubIntegrationSettings(
//       {
//         repo: e.repoId,                                       
//         inkeepGitHubAppIdentifier: process.env
//           .INKEEP_GITHUB_APP_IDENTIFIER as GitHubAppType,    // your env-var for GitHub app
//       },
//       githubSettingsCache,                           
//     );

//     // pick off only the pieces you need
//     const { apiKey, previewEnabled } = fullConfig;
//     return { apiKey, previewEnabled };

//   } catch (err) {
//     console.error(`GitHub integration not found for repo ${e.repoId}`, err);

//     if (botWasMentioned) {
//       // your say() now just takes a string
//       await e.say(
//         `⚠️ GitHub integration isn’t enabled for this repository (${e.repoId}).`
//       );
//     }
//     // returning undefined signals “no config available”
//   }
//   return undefined;
// };
