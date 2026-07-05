import {
  GoogleGenerativeAI,
  GenerativeModel,
  Content,
  Part,
} from '@google/generative-ai';
import {
  AiProviderInterface,
  ChatMessage,
  ChatOptions,
  ContentPart,
} from '../interfaces/ai-provider.interface';

export class GeminiProvider implements AiProviderInterface {
  private genAI: GoogleGenerativeAI;
  private defaultModel: string;
  private embeddingModel: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.defaultModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    this.embeddingModel =
      process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';
  }

  private getModel(modelName?: string): GenerativeModel {
    return this.genAI.getGenerativeModel({
      model: modelName || this.defaultModel,
    });
  }
  private formatMessages(messages: ChatMessage[]): {
    systemInstruction?: string;
    history: Content[];
    lastUserMessage: string | Part[];
  } {
    let systemInstruction: string | undefined;
    const rawHistory: Content[] = [];
    let lastUserMessage: string | Part[] = '';

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];

      if (msg.role === 'system') {
        systemInstruction = typeof msg.content === 'string'
          ? msg.content
          : (msg.content as ContentPart[])
              .filter((p) => p.type === 'text')
              .map((p) => p.text)
              .join('\n');
        continue;
      }

      // Convert content to Part[]
      let parts: Part[] = [];
      if (typeof msg.content === 'string') {
        parts = [{ text: msg.content }];
      } else {
        parts = (msg.content as ContentPart[]).map((part) => {
          if (part.type === 'text') return { text: part.text! };
          if (part.type === 'image_url') {
            return {
              inlineData: {
                mimeType: 'image/png',
                data: part.image_url!.url.replace(/^data:image\/\w+;base64,/, ''),
              },
            };
          }
          if (part.type === 'file' && part.file) {
            return {
              inlineData: {
                mimeType: part.file.mimeType,
                data: part.file.data,
              },
            };
          }
          return { text: '' };
        });
      }

      const role = msg.role === 'assistant' ? 'model' : 'user';
      rawHistory.push({ role, parts });
    }

    // Extract last user message if rawHistory ends with user
    const history = [...rawHistory];
    if (history.length > 0 && history[history.length - 1].role === 'user') {
      const last = history.pop()!;
      lastUserMessage = last.parts.length === 1 && 'text' in last.parts[0] && typeof last.parts[0].text === 'string'
        ? last.parts[0].text
        : last.parts;
    } else {
      lastUserMessage = '';
    }

    // Clean up history for Gemini:
    // 1. Remove leading model messages
    while (history.length > 0 && history[0].role === 'model') {
      history.shift();
    }

    // 2. Merge consecutive identical roles
    const cleanHistory: Content[] = [];
    for (const item of history) {
      if (cleanHistory.length === 0) {
        cleanHistory.push(item);
      } else {
        const lastItem = cleanHistory[cleanHistory.length - 1];
        if (lastItem.role === item.role) {
          lastItem.parts = [...lastItem.parts, ...item.parts];
        } else {
          cleanHistory.push(item);
        }
      }
    }

    return { systemInstruction, history: cleanHistory, lastUserMessage };
  }
  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    const model = this.getModel(options?.model);
    const { systemInstruction, history, lastUserMessage } =
      this.formatMessages(messages);

    const chat = model.startChat({
      history,
      ...(systemInstruction
        ? { systemInstruction: { parts: [{ text: systemInstruction }], role: 'user' } as any }
        : {}),
      generationConfig: {
        temperature: options?.temperature ?? 0.4,
        maxOutputTokens: options?.maxTokens || 4096,
        ...(options?.responseFormat === 'json'
          ? { responseMimeType: 'application/json' }
          : {}),
      },
    });

    const result = await chat.sendMessage(
      typeof lastUserMessage === 'string'
        ? lastUserMessage
        : lastUserMessage,
    );
    return result.response.text();
  }

  async *chatStream(
    messages: ChatMessage[],
    options?: ChatOptions,
  ): AsyncIterable<string> {
    const model = this.getModel(options?.model);
    const { systemInstruction, history, lastUserMessage } =
      this.formatMessages(messages);

    const chat = model.startChat({
      history,
      ...(systemInstruction
        ? { systemInstruction: { parts: [{ text: systemInstruction }], role: 'user' } as any }
        : {}),
      generationConfig: {
        temperature: options?.temperature ?? 0.4,
        maxOutputTokens: options?.maxTokens || 4096,
      },
    });

    const result = await chat.sendMessageStream(
      typeof lastUserMessage === 'string'
        ? lastUserMessage
        : lastUserMessage,
    );

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const model = this.genAI.getGenerativeModel({ model: this.embeddingModel });
    const result = await model.embedContent(text);
    return result.embedding.values;
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    for (const text of texts) {
      const emb = await this.generateEmbedding(text);
      results.push(emb);
    }
    return results;
  }
}
