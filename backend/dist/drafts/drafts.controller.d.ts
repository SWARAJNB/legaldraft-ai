import { DraftsService } from './drafts.service';
export declare class DraftsController {
    private readonly draftsService;
    constructor(draftsService: DraftsService);
    create(dto: any, tenantId: string, user: {
        id: string;
    }): Promise<import("./entities/draft.entity").Draft>;
    findAll(tenantId: string): Promise<import("./entities/draft.entity").Draft[]>;
    findById(id: string): Promise<import("./entities/draft.entity").Draft>;
    update(id: string, dto: any): Promise<import("./entities/draft.entity").Draft>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
