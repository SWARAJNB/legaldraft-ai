import { AiProviderInterface, ChatMessage, ChatOptions } from '../interfaces/ai-provider.interface';
export declare class GeminiProvider implements AiProviderInterface {
    private genAI;
    private defaultModel;
    private embeddingModel;
    constructor();
    private getModel;
    private formatMessages;
    chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>;
    chatStream(messages: ChatMessage[], options?: ChatOptions): AsyncIterable<string>;
    generateEmbedding(text: string): Promise<number[]>;
    generateEmbeddings(texts: string[]): Promise<number[][]>;
}
