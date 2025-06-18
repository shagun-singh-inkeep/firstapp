export interface InkeepQAResponse {
    text: string;
    aiAnnotations: {
        answerConfidence: string;
        explanation?: string;
    };
}
export default function queryInkeepQA(question: string): Promise<InkeepQAResponse>;
