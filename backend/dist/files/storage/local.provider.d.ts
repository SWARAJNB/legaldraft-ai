import { StorageProvider } from './storage.interface';
export declare class LocalStorageProvider implements StorageProvider {
    private baseDir;
    constructor(baseDir?: string);
    private getFullPath;
    uploadFile(tenantId: string, category: string, filename: string, content: Buffer): Promise<string>;
    downloadFile(key: string): Promise<Buffer>;
    deleteFile(key: string): Promise<boolean>;
    getPresignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;
    getPresignedUploadUrl(tenantId: string, category: string, filename: string, expiresIn?: number): Promise<{
        url: string;
        fields: Record<string, any>;
    }>;
}
