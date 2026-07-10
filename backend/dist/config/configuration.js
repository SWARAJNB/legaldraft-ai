"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT || '8000', 10),
    database: {
        url: process.env.DATABASE_URL || 'postgresql://legaldraft:legaldraft_password@localhost:5432/legaldraft_ai',
    },
    ai: {
        geminiApiKey: process.env.GEMINI_API_KEY,
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'dev_secret_key',
    },
    storage: {
        bucketName: process.env.S3_BUCKET_NAME,
        region: process.env.AWS_REGION,
    }
});
//# sourceMappingURL=configuration.js.map