import { TemplatesService } from './templates.service';
export declare class TemplatesController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    findAll(tenantId: string): Promise<import("./entities/template.entity").Template[]>;
    findById(id: string): Promise<import("./entities/template.entity").Template | null>;
    create(dto: any, tenantId: string, user: {
        id: string;
    }): Promise<import("./entities/template.entity").Template>;
}
