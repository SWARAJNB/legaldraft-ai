export declare class PdfParseService {
    private readonly logger;
    extractText(buffer: Buffer): Promise<string>;
}
export declare class DocxParseService {
    private readonly logger;
    extractText(buffer: Buffer): Promise<string>;
    extractHtml(buffer: Buffer): Promise<string>;
}
export declare class OcrService {
    private readonly logger;
    extractText(buffer: Buffer, mimeType: string): Promise<string>;
}
export declare class DocumentMetadataService {
    extractEntities(text: string): {
        caseNumbers: string[];
        dates: string[];
        legalSections: string[];
        parties: string[];
    };
}
