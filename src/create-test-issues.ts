import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const TARGET_REPO = "shagun-singh-inkeep/drizzle-orm-docs"; // your fork
const NUM_ISSUES = 5;

const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error("❌ GITHUB_TOKEN not found in .env");

async function createIssue(issue: any) {
  const [owner, repo] = TARGET_REPO.split("/");

  const payload = {
    title: issue.title,
    body: issue.body || "",
    labels: issue.labels || []
  };

  const res = await axios.post(
    `https://api.github.com/repos/${owner}/${repo}/issues`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json"
      }
    }
  );

  return res.data.html_url;
}

async function run() {
  const issues = JSON.parse(fs.readFileSync("fetched_issues.json", "utf-8")).slice(0, NUM_ISSUES);

  for (let i = 0; i < issues.length; i++) {
    const issue = issues[i];
    try {
      const url = await createIssue(issue);
      console.log(`✅ Created issue #${i + 1}: ${url}`);
    } catch (e: any) {
      console.error(`❌ Failed to create issue #${i + 1}:`, e.message);
    }
  }
}

run();
