export interface StorageProvider {
  /**
   * Upload file to storage.
   * @returns Storage key (e.g. S3 key or local path)
   */
  uploadFile(
    tenantId: string,
    category: string,
    filename: string,
    content: Buffer,
  ): Promise<string>;

  /**
   * Download file from storage.
   * @returns File content as Buffer
   */
  downloadFile(key: string): Promise<Buffer>;

  /**
   * Delete file from storage.
   * @returns true if deleted
   */
  deleteFile(key: string): Promise<boolean>;

  /**
   * Generate a temporary download URL.
   */
  getPresignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;

  /**
   * Generate a temporary upload URL/payload.
   */
  getPresignedUploadUrl(
    tenantId: string,
    category: string,
    filename: string,
    expiresIn?: number,
  ): Promise<{ url: string; fields: Record<string, any> }>;
}
