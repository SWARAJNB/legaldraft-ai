"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const generative_ai_1 = require("@google/generative-ai");
class GeminiProvider {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '';
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.defaultModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
        this.embeddingModel =
            process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';
    }
    getModel(modelName) {
        return this.genAI.getGenerativeModel({
            model: modelName || this.defaultModel,
        });
    }
    formatMessages(messages) {
        let systemInstruction;
        const rawHistory = [];
        let lastUserMessage = '';
        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            if (msg.role === 'system') {
                systemInstruction = typeof msg.content === 'string'
                    ? msg.content
                    : msg.content
                        .filter((p) => p.type === 'text')
                        .map((p) => p.text)
                        .join('\n');
                continue;
            }
            let parts = [];
            if (typeof msg.content === 'string') {
                parts = [{ text: msg.content }];
            }
            else {
                parts = msg.content.map((part) => {
                    if (part.type === 'text')
                        return { text: part.text };
                    if (part.type === 'image_url') {
                        return {
                            inlineData: {
                                mimeType: 'image/png',
                                data: part.image_url.url.replace(/^data:image\/\w+;base64,/, ''),
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
        const history = [...rawHistory];
        if (history.length > 0 && history[history.length - 1].role === 'user') {
            const last = history.pop();
            lastUserMessage = last.parts.length === 1 && 'text' in last.parts[0] && typeof last.parts[0].text === 'string'
                ? last.parts[0].text
                : last.parts;
        }
        else {
            lastUserMessage = '';
        }
        while (history.length > 0 && history[0].role === 'model') {
            history.shift();
        }
        const cleanHistory = [];
        for (const item of history) {
            if (cleanHistory.length === 0) {
                cleanHistory.push(item);
            }
            else {
                const lastItem = cleanHistory[cleanHistory.length - 1];
                if (lastItem.role === item.role) {
                    lastItem.parts = [...lastItem.parts, ...item.parts];
                }
                else {
                    cleanHistory.push(item);
                }
            }
        }
        return { systemInstruction, history: cleanHistory, lastUserMessage };
    }
    async chat(messages, options) {
        const model = this.getModel(options?.model);
        const { systemInstruction, history, lastUserMessage } = this.formatMessages(messages);
        const chat = model.startChat({
            history,
            ...(systemInstruction
                ? { systemInstruction: { parts: [{ text: systemInstruction }], role: 'user' } }
                : {}),
            generationConfig: {
                temperature: options?.temperature ?? 0.4,
                maxOutputTokens: options?.maxTokens || 4096,
                ...(options?.responseFormat === 'json'
                    ? { responseMimeType: 'application/json' }
                    : {}),
            },
        });
        const result = await chat.sendMessage(typeof lastUserMessage === 'string'
            ? lastUserMessage
            : lastUserMessage);
        return result.response.text();
    }
    async *chatStream(messages, options) {
        const model = this.getModel(options?.model);
        const { systemInstruction, history, lastUserMessage } = this.formatMessages(messages);
        const chat = model.startChat({
            history,
            ...(systemInstruction
                ? { systemInstruction: { parts: [{ text: systemInstruction }], role: 'user' } }
                : {}),
            generationConfig: {
                temperature: options?.temperature ?? 0.4,
                maxOutputTokens: options?.maxTokens || 4096,
            },
        });
        const result = await chat.sendMessageStream(typeof lastUserMessage === 'string'
            ? lastUserMessage
            : lastUserMessage);
        for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
                yield text;
            }
        }
    }
    async generateEmbedding(text) {
        const model = this.genAI.getGenerativeModel({ model: this.embeddingModel });
        const result = await model.embedContent(text);
        return result.embedding.values;
    }
    async generateEmbeddings(texts) {
        const results = [];
        for (const text of texts) {
            const emb = await this.generateEmbedding(text);
            results.push(emb);
        }
        return results;
    }
}
exports.GeminiProvider = GeminiProvider;
//# sourceMappingURL=gemini.provider.js.map