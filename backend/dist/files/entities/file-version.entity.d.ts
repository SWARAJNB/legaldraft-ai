import { FileEntity } from './file.entity';
export declare class FileVersion {
    id: string;
    fileId: string;
    versionNumber: number;
    s3Key: string;
    fileSize: number;
    uploadedBy: string;
    createdAt: Date;
    file: FileEntity;
}
