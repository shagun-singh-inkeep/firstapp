"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const TARGET_REPO = "shagun-singh-inkeep/drizzle-orm-docs"; // your fork
const NUM_ISSUES = 5;
const token = process.env.GITHUB_TOKEN;
if (!token)
    throw new Error("❌ GITHUB_TOKEN not found in .env");
async function createIssue(issue) {
    const [owner, repo] = TARGET_REPO.split("/");
    const payload = {
        title: issue.title,
        body: issue.body || "",
        labels: issue.labels || []
    };
    const res = await axios_1.default.post(`https://api.github.com/repos/${owner}/${repo}/issues`, payload, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json"
        }
    });
    return res.data.html_url;
}
async function run() {
    const issues = JSON.parse(fs_1.default.readFileSync("fetched_issues.json", "utf-8")).slice(0, NUM_ISSUES);
    for (let i = 0; i < issues.length; i++) {
        const issue = issues[i];
        try {
            const url = await createIssue(issue);
            console.log(`✅ Created issue #${i + 1}: ${url}`);
        }
        catch (e) {
            console.error(`❌ Failed to create issue #${i + 1}:`, e.message);
        }
    }
}
run();
//# sourceMappingURL=create-test-issues.js.map