import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageProvider } from './storage.interface';

export class S3StorageProvider implements StorageProvider {
  private s3: S3Client;
  public readonly bucketName: string;

  constructor() {
    const config: any = {
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

    this.s3 = new S3Client(config);
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'legaldraft-bucket';
  }

  async uploadFile(
    tenantId: string,
    category: string,
    filename: string,
    content: Buffer,
  ): Promise<string> {
    const s3Key = `tenants/${tenantId}/${category}/${filename}`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: content,
      }),
    );
    return s3Key;
  }

  async downloadFile(key: string): Promise<Buffer> {
    const response = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
    const chunks: Buffer[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async getPresignedDownloadUrl(
    key: string,
    expiresIn = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  async getPresignedUploadUrl(
    tenantId: string,
    category: string,
    filename: string,
    expiresIn = 3600,
  ): Promise<{ url: string; fields: Record<string, any> }> {
    const s3Key = `tenants/${tenantId}/${category}/${filename}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    });
    const url = await getSignedUrl(this.s3, command, { expiresIn });
    return { url, fields: { key: s3Key, method: 'PUT' } };
  }
}
