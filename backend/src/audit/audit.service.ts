import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
  ) {}

  async log(params: {
    userId: string;
    userName: string;
    action: string;
    resource: string;
    resourceId?: string;
    ipAddress?: string;
    details?: string;
    metadata?: Record<string, any>;
  }) {
    const entry = this.auditRepo.create(params);
    return this.auditRepo.save(entry);
  }

  async findAll(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  }) {
    const query = this.auditRepo.createQueryBuilder('log');

    if (filters?.userId) {
      query.andWhere('log.user_id = :userId', { userId: filters.userId });
    }
    if (filters?.action) {
      query.andWhere('log.action = :action', { action: filters.action });
    }
    if (filters?.resource) {
      query.andWhere('log.resource = :resource', { resource: filters.resource });
    }
    if (filters?.from) {
      query.andWhere('log.created_at >= :from', { from: filters.from });
    }
    if (filters?.to) {
      query.andWhere('log.created_at <= :to', { to: filters.to });
    }

    query.orderBy('log.created_at', 'DESC');
    query.take(filters?.limit || 50);
    query.skip(filters?.offset || 0);

    const [items, total] = await query.getManyAndCount();
    return { items, total };
  }
}
