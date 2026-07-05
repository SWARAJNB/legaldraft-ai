import { Repository } from 'typeorm';
import { Template } from './entities/template.entity';
export declare class TemplatesService {
    private templatesRepo;
    constructor(templatesRepo: Repository<Template>);
    findAll(tenantId?: string): Promise<Template[]>;
    findById(id: string): Promise<Template | null>;
    create(tenantId: string, userId: string, dto: Partial<Template>): Promise<Template>;
    incrementUsage(id: string): Promise<void>;
    seedSystemTemplates(): Promise<void>;
}
