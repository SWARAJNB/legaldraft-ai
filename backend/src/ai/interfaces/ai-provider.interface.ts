/**
 * Abstract AI provider interface.
 * Implemented by the active Gemini provider.
 */
export interface AiProviderInterface {
  /**
   * Send a chat completion request and get the full response.
   */
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<string>;

  /**
   * Send a chat completion request and stream tokens back.
   */
  chatStream(
    messages: ChatMessage[],
    options?: ChatOptions,
  ): AsyncIterable<string>;

  /**
   * Generate an embedding vector for a single text.
   */
  generateEmbedding(text: string): Promise<number[]>;

  /**
   * Generate embedding vectors for multiple texts (batch).
   */
  generateEmbeddings(texts: string[]): Promise<number[][]>;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | ContentPart[];
}

export interface ContentPart {
  type: 'text' | 'image_url' | 'file';
  text?: string;
  image_url?: { url: string };
  file?: { data: string; mimeType: string }; // base64 encoded
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
  model?: string;
}
