"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = queryInkeepQA;
const axios_1 = __importDefault(require("axios"));
async function queryInkeepQA(question) {
    const apiKey = process.env.INKEEP_API_KEY;
    const endpoint = "https://api.inkeep.com/v1/chat/completions";
    try {
        const response = await axios_1.default.post(endpoint, {
            model: "inkeep-qa-expert", // or whichever model you're using
            messages: [
                {
                    role: "user",
                    content: question
                }
            ],
        }, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            }
        });
        const choice = response.data.choices?.[0];
        const text = choice?.message?.content ?? "⚠️ No answer found.";
        const answerConfidence = choice?.message?.metadata?.answerConfidence ?? "unknown";
        const explanation = choice?.message?.metadata?.explanation ?? "";
        console.log("🔍 Full Inkeep response:", JSON.stringify(response.data, null, 2));
        return {
            text,
            aiAnnotations: {
                answerConfidence,
                explanation
            }
        };
    }
    catch (err) {
        console.error("Inkeep API error:", err?.message);
        return {
            text: "⚠️ Sorry, I couldn't reach Inkeep to generate a response.",
            aiAnnotations: {
                answerConfidence: "not_confident",
                explanation: ""
            }
        };
    }
}
//# sourceMappingURL=inkeepClient.js.map