import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
export declare class AuditService {
    private auditRepo;
    constructor(auditRepo: Repository<AuditLog>);
    log(params: {
        userId: string;
        userName: string;
        action: string;
        resource: string;
        resourceId?: string;
        ipAddress?: string;
        details?: string;
        metadata?: Record<string, any>;
    }): Promise<AuditLog>;
    findAll(filters?: {
        userId?: string;
        action?: string;
        resource?: string;
        from?: string;
        to?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        items: AuditLog[];
        total: number;
    }>;
}
