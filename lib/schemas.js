"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvideRecordsConsideredToolSchema = exports.ProvideAIAnnotationsToolSchema = exports.ProvideLinksToolSchema = exports.LinksSchema = void 0;
const zod_1 = require("zod");
/* Inkeep QA Tools - GitHub Bot Version */
const InkeepRecordTypes = zod_1.z.enum([
    'documentation',
    'site',
    'discourse_post',
    'github_issue',
    'github_discussion',
    'stackoverflow_question',
    'discord_forum_post',
    'discord_message',
    'custom_question_answer',
]);
const LinkType = zod_1.z.union([
    InkeepRecordTypes,
    zod_1.z.string(), // catch all
]);
const LinkSchema = zod_1.z
    .object({
    label: zod_1.z.string().nullish(), // the value of the footnote, e.g. `1`
    url: zod_1.z.string(),
    title: zod_1.z.string().nullish(),
    description: zod_1.z.string().nullish(),
    type: LinkType.nullish(),
    breadcrumbs: zod_1.z.array(zod_1.z.string()).nullish(),
})
    .passthrough();
exports.LinksSchema = zod_1.z.array(LinkSchema).nullish();
exports.ProvideLinksToolSchema = zod_1.z.object({
    links: exports.LinksSchema,
});
const KnownAnswerConfidence = zod_1.z.enum(['very_confident', 'somewhat_confident', 'not_confident', 'no_sources', 'other']);
const AnswerConfidence = zod_1.z.union([KnownAnswerConfidence, zod_1.z.string()]);
const AIAnnotationsToolSchema = zod_1.z
    .object({
    answerConfidence: AnswerConfidence,
    explanation: zod_1.z.string().optional(), // Optional explanation for the confidence level
})
    .passthrough();
exports.ProvideAIAnnotationsToolSchema = zod_1.z.object({
    aiAnnotations: AIAnnotationsToolSchema,
});
exports.ProvideRecordsConsideredToolSchema = zod_1.z.object({
    recordsConsidered: zod_1.z.array(zod_1.z
        .object({
        type: zod_1.z.string(),
        url: zod_1.z.string(),
        title: zod_1.z.string(),
        breadcrumbs: zod_1.z.array(zod_1.z.string()).nullish(),
    })
        .passthrough()),
});
//# sourceMappingURL=schemas.js.map