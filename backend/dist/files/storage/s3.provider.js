"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3StorageProvider = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
class S3StorageProvider {
    constructor() {
        const config = {
            region: process.env.AWS_REGION || 'ap-south-1',
        };
        if (process.env.AWS_ACCESS_KEY_ID) {
            config.credentials = {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            };
        }
        if (process.env.AWS_S3_ENDPOINT_URL) {
            config.endpoint = process.env.AWS_S3_ENDPOINT_URL;
            config.forcePathStyle = true;
        }
        this.s3 = new client_s3_1.S3Client(config);
        this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'legaldraft-bucket';
    }
    async uploadFile(tenantId, category, filename, content) {
        const s3Key = `tenants/${tenantId}/${category}/${filename}`;
        await this.s3.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucketName,
            Key: s3Key,
            Body: content,
        }));
        return s3Key;
    }
    async downloadFile(key) {
        const response = await this.s3.send(new client_s3_1.GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        }));
        const chunks = [];
        for await (const chunk of response.Body) {
            chunks.push(Buffer.from(chunk));
        }
        return Buffer.concat(chunks);
    }
    async deleteFile(key) {
        try {
            await this.s3.send(new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            }));
            return true;
        }
        catch {
            return false;
        }
    }
    async getPresignedDownloadUrl(key, expiresIn = 3600) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, { expiresIn });
    }
    async getPresignedUploadUrl(tenantId, category, filename, expiresIn = 3600) {
        const s3Key = `tenants/${tenantId}/${category}/${filename}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucketName,
            Key: s3Key,
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, { expiresIn });
        return { url, fields: { key: s3Key, method: 'PUT' } };
    }
}
exports.S3StorageProvider = S3StorageProvider;
//# sourceMappingURL=s3.provider.js.map