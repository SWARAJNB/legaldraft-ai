export declare class PdfExportService {
    generateFromText(content: string, title: string): Promise<Buffer>;
    private escapeText;
    private calculateStreamLength;
}
