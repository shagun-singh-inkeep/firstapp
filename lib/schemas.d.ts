import { z } from 'zod';
declare const LinkSchema: z.ZodObject<{
    label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    url: z.ZodString;
    title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodEnum<["documentation", "site", "discourse_post", "github_issue", "github_discussion", "stackoverflow_question", "discord_forum_post", "discord_message", "custom_question_answer"]>, z.ZodString]>>>;
    breadcrumbs: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    url: z.ZodString;
    title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodEnum<["documentation", "site", "discourse_post", "github_issue", "github_discussion", "stackoverflow_question", "discord_forum_post", "discord_message", "custom_question_answer"]>, z.ZodString]>>>;
    breadcrumbs: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    url: z.ZodString;
    title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodEnum<["documentation", "site", "discourse_post", "github_issue", "github_discussion", "stackoverflow_question", "discord_forum_post", "discord_message", "custom_question_answer"]>, z.ZodString]>>>;
    breadcrumbs: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
}, z.ZodTypeAny, "passthrough">>;
export declare const LinksSchema: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
    label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    url: z.ZodString;
    title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodEnum<["documentation", "site", "discourse_post", "github_issue", "github_discussion", "stackoverflow_question", "discord_forum_post", "discord_message", "custom_question_answer"]>, z.ZodString]>>>;
    breadcrumbs: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    url: z.ZodString;
    title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodEnum<["documentation", "site", "discourse_post", "github_issue", "github_discussion", "stackoverflow_question", "discord_forum_post", "discord_message", "custom_question_answer"]>, z.ZodString]>>>;
    breadcrumbs: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    url: z.ZodString;
    title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodEnum<["documentation", "site", "discourse_post", "github_issue", "github_discussion", "stackoverflow_question", "discord_forum_post", "discord_message", "custom_question_answer"]>, z.ZodString]>>>;
    breadcrumbs: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
}, z.ZodTypeAny, "passthrough">>, "many">>>;
export declare const ProvideLinksToolSchema: z.ZodObject<{
    links: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
        label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        url: z.ZodString;
        title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        type: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodEnum<["documentation", "site", "discourse_post", "github_issue", "github_discussion", "stackoverflow_question", "discord_forum_post", "discord_message", "custom_question_answer"]>, z.ZodString]>>>;
        breadcrumbs: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        url: z.ZodString;
        title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        type: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodEnum<["documentation", "site", "discourse_post", "github_issue", "github_discussion", "stackoverflow_question", "discord_forum_post", "discord_message", "custom_question_answer"]>, z.ZodString]>>>;
        breadcrumbs: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        url: z.ZodString;
        title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        type: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodEnum<["documentation", "site", "discourse_post", "github_issue", "github_discussion", "stackoverflow_question", "discord_forum_post", "discord_message", "custom_question_answer"]>, z.ZodString]>>>;
        breadcrumbs: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>;
}, "strip", z.ZodTypeAny, {
    links?: z.objectOutputType<{
        label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        url: z.ZodString;
        title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        type: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodEnum<["documentation", "site", "discourse_post", "github_issue", "github_discussion", "stackoverflow_question", "discord_forum_post", "discord_message", "custom_question_answer"]>, z.ZodString]>>>;
        breadcrumbs: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    }, z.ZodTypeAny, "passthrough">[] | null | undefined;
}, {
    links?: z.objectInputType<{
        label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        url: z.ZodString;
        title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        type: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodEnum<["documentation", "site", "discourse_post", "github_issue", "github_discussion", "stackoverflow_question", "discord_forum_post", "discord_message", "custom_question_answer"]>, z.ZodString]>>>;
        breadcrumbs: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    }, z.ZodTypeAny, "passthrough">[] | null | undefined;
}>;
declare const AnswerConfidence: z.ZodUnion<[z.ZodEnum<["very_confident", "somewhat_confident", "not_confident", "no_sources", "other"]>, z.ZodString]>;
declare const AIAnnotationsToolSchema: z.ZodObject<{
    answerConfidence: z.ZodUnion<[z.ZodEnum<["very_confident", "somewhat_confident", "not_confident", "no_sources", "other"]>, z.ZodString]>;
    explanation: z.ZodOptional<z.ZodString>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    answerConfidence: z.ZodUnion<[z.ZodEnum<["very_confident", "somewhat_confident", "not_confident", "no_sources", "other"]>, z.ZodString]>;
    explanation: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    answerConfidence: z.ZodUnion<[z.ZodEnum<["very_confident", "somewhat_confident", "not_confident", "no_sources", "other"]>, z.ZodString]>;
    explanation: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">>;
export declare const ProvideAIAnnotationsToolSchema: z.ZodObject<{
    aiAnnotations: z.ZodObject<{
        answerConfidence: z.ZodUnion<[z.ZodEnum<["very_confident", "somewhat_confident", "not_confident", "no_sources", "other"]>, z.ZodString]>;
        explanation: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        answerConfidence: z.ZodUnion<[z.ZodEnum<["very_confident", "somewhat_confident", "not_confident", "no_sources", "other"]>, z.ZodString]>;
        explanation: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        answerConfidence: z.ZodUnion<[z.ZodEnum<["very_confident", "somewhat_confident", "not_confident", "no_sources", "other"]>, z.ZodString]>;
        explanation: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    aiAnnotations: {
        answerConfidence: string;
        explanation?: string | undefined;
    } & {
        [k: string]: unknown;
    };
}, {
    aiAnnotations: {
        answerConfidence: string;
        explanation?: string | undefined;
    } & {
        [k: string]: unknown;
    };
}>;
export declare const ProvideRecordsConsideredToolSchema: z.ZodObject<{
    recordsConsidered: z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        url: z.ZodString;
        title: z.ZodString;
        breadcrumbs: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodString;
        url: z.ZodString;
        title: z.ZodString;
        breadcrumbs: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodString;
        url: z.ZodString;
        title: z.ZodString;
        breadcrumbs: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
}, "strip", z.ZodTypeAny, {
    recordsConsidered: z.objectOutputType<{
        type: z.ZodString;
        url: z.ZodString;
        title: z.ZodString;
        breadcrumbs: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    }, z.ZodTypeAny, "passthrough">[];
}, {
    recordsConsidered: z.objectInputType<{
        type: z.ZodString;
        url: z.ZodString;
        title: z.ZodString;
        breadcrumbs: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    }, z.ZodTypeAny, "passthrough">[];
}>;
export type LinkType = z.infer<typeof LinkSchema>;
export type LinksType = z.infer<typeof LinksSchema>;
export type AIAnnotationsType = z.infer<typeof AIAnnotationsToolSchema>;
export type AnswerConfidenceType = z.infer<typeof AnswerConfidence>;
export {};
