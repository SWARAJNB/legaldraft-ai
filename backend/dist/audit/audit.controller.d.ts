import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(userId?: string, action?: string, resource?: string, from?: string, to?: string, limit?: string, offset?: string): Promise<{
        items: import("./entities/audit-log.entity").AuditLog[];
        total: number;
    }>;
}
