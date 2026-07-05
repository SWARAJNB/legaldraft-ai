"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RagService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RagService = void 0;
const common_1 = require("@nestjs/common");
let RagService = RagService_1 = class RagService {
    constructor() {
        this.logger = new common_1.Logger(RagService_1.name);
        this.isAvailable = false;
    }
    async onModuleInit() {
        this.logger.log('RAG service initialized (pgvector checked on first use)');
    }
    chunkText(text, chunkSize = 500, overlap = 50) {
        const words = text.split(/\s+/);
        const chunks = [];
        let i = 0;
        let chunkIndex = 0;
        while (i < words.length) {
            const chunk = words.slice(i, i + chunkSize).join(' ');
            chunks.push({ text: chunk, index: chunkIndex });
            i += chunkSize - overlap;
            chunkIndex++;
        }
        return chunks;
    }
    async storeEmbeddings(documentId, chunks, embeddings) {
        this.logger.log(`Storing ${chunks.length} embeddings for document ${documentId}`);
    }
    async searchSimilar(queryEmbedding, topK = 5) {
        this.logger.log(`Searching top-${topK} similar chunks`);
        return [];
    }
};
exports.RagService = RagService;
exports.RagService = RagService = RagService_1 = __decorate([
    (0, common_1.Injectable)()
], RagService);
//# sourceMappingURL=rag.service.js.map