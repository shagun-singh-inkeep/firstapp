// src/githubDerivedTypes.d.ts

import type { Context } from "probot";
import type { Octokit } from "@octokit/rest" with { "resolution-mode": "import" };
export type IssueOpenedParams =
  Context<"issues.opened" | "issues.reopened">;

export type IssueCommentCreatedParams =
  Context<"issue_comment.created">;

// ——— Normalized event your pipeline expects ———
export interface HandleGitHubEvent {
  /** “owner/repo” */
  repoId:    string;
  /** issue number, for grouping */
  threadTs:       string;
  /** same as workspaceId */
  channelId:      string;
  /** unique per‐message (issue.id or comment.id) */
  messageTs:      string;
  /** GitHub login of author */
  messageAuthorId:string;
  /** text of title or comment */
  messageContent: string;
  /** reply back on the issue */
  say: (response: string) => Promise<
    ReturnType<Octokit["issues"]["createComment"]>
  >;
  /** raw Octokit client */
  client:         Octokit;
  /** your App installation ID */
  botId:          string;
}
