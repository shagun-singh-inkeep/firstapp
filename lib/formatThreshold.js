"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatInkeepResponseWithThreshold = formatInkeepResponseWithThreshold;
function mapConfidenceToPercentage(level) {
    switch (level) {
        case "very_confident": return 95;
        case "confident": return 80;
        case "unsure": return 55;
        case "very_unsure": return 25;
        case "none":
        case "unknown":
        default: return 0;
    }
}
function formatInkeepResponseWithThreshold(rawText, confidenceLabel, minPercent = 54) {
    const confidencePercent = mapConfidenceToPercentage(confidenceLabel);
    if (confidencePercent < minPercent) {
        console.log(`🔇 Skipped (confidence: ${confidenceLabel}, ${confidencePercent}%)`);
        return null;
    }
    let prefix = "🤖 Here's a suggested answer from Inkeep:\n\n";
    if (confidencePercent < 80) {
        prefix = "💡 *AI-generated (low confidence)*:\n\n";
    }
    return `${prefix}${rawText}`;
}
//# sourceMappingURL=formatThreshold.js.map