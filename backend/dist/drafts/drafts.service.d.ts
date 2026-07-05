import { Repository } from 'typeorm';
import { Draft } from './entities/draft.entity';
export declare class DraftsService {
    private draftsRepo;
    constructor(draftsRepo: Repository<Draft>);
    create(tenantId: string, userId: string, dto: Partial<Draft>): Promise<Draft>;
    findAll(tenantId: string): Promise<Draft[]>;
    findById(id: string): Promise<Draft>;
    update(id: string, dto: Partial<Draft>): Promise<Draft>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
