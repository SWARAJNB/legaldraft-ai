import { StorageProvider } from './storage.interface';
export declare class S3StorageProvider implements StorageProvider {
    private s3;
    readonly bucketName: string;
    constructor();
    uploadFile(tenantId: string, category: string, filename: string, content: Buffer): Promise<string>;
    downloadFile(key: string): Promise<Buffer>;
    deleteFile(key: string): Promise<boolean>;
    getPresignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;
    getPresignedUploadUrl(tenantId: string, category: string, filename: string, expiresIn?: number): Promise<{
        url: string;
        fields: Record<string, any>;
    }>;
}
