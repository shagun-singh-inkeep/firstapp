"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const SOURCE_REPO = "drizzle-team/drizzle-orm-docs"; // or any repo you want
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const MAX_PAGES = 2; // increase if you want more issues
const PER_PAGE = 10;
async function fetchAllIssues() {
    let allIssues = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
        const url = `https://api.github.com/repos/${SOURCE_REPO}/issues?state=all&per_page=${PER_PAGE}&page=${page}`;
        const res = await axios_1.default.get(url, {
            headers: {
                Accept: "application/vnd.github+json",
                ...(GITHUB_TOKEN && { Authorization: `Bearer ${GITHUB_TOKEN}` })
            }
        });
        const issuesOnly = res.data.filter((issue) => !("pull_request" in issue));
        console.log(`Page ${page}: ${issuesOnly.length} issues (excluding PRs)`);
        allIssues.push(...issuesOnly);
        // stop early if no more pages
        if (res.data.length < PER_PAGE)
            break;
        await new Promise(res => setTimeout(res, 500));
    }
    console.log(`\n✅ Total issues fetched (open + closed): ${allIssues.length}`);
    fs_1.default.writeFileSync("fetched_issues.json", JSON.stringify(allIssues, null, 2));
}
fetchAllIssues().catch(err => {
    console.error("❌ Error fetching issues:", err.message);
});
//# sourceMappingURL=fetch-issues.js.map