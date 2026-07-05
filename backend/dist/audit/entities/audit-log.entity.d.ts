export declare class AuditLog {
    id: string;
    userId: string;
    userName: string;
    action: string;
    resource: string;
    resourceId: string;
    ipAddress: string;
    details: string;
    metadata: Record<string, any>;
    createdAt: Date;
}
