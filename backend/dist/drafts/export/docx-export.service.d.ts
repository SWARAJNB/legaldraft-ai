export declare class DocxExportService {
    generateFromText(content: string, title: string): Promise<Buffer>;
    generateFromTemplate(templateBuffer: Buffer, data: Record<string, any>): Promise<Buffer>;
    detectPlaceholders(templateBuffer: Buffer): Promise<string[]>;
}
