import { FileVersion } from './file-version.entity';
export declare class FileEntity {
    id: string;
    tenantId: string;
    fileName: string;
    originalName: string;
    fileType: string;
    fileSize: number;
    s3Key: string;
    bucketName: string;
    uploadedBy: string;
    createdAt: Date;
    versions: FileVersion[];
}
