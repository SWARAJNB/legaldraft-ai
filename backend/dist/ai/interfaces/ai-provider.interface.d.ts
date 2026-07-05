export interface AiProviderInterface {
    chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>;
    chatStream(messages: ChatMessage[], options?: ChatOptions): AsyncIterable<string>;
    generateEmbedding(text: string): Promise<number[]>;
    generateEmbeddings(texts: string[]): Promise<number[][]>;
}
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string | ContentPart[];
}
export interface ContentPart {
    type: 'text' | 'image_url' | 'file';
    text?: string;
    image_url?: {
        url: string;
    };
    file?: {
        data: string;
        mimeType: string;
    };
}
export interface ChatOptions {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: 'text' | 'json';
    model?: string;
}
