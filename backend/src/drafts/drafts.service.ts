import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Draft } from './entities/draft.entity';

@Injectable()
export class DraftsService {
  constructor(
    @InjectRepository(Draft)
    private draftsRepo: Repository<Draft>,
  ) {}

  async create(tenantId: string, userId: string, dto: Partial<Draft>) {
    const caseNumber = `CAS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const wordCount = dto.content
      ? dto.content.trim().split(/\s+/).filter(Boolean).length
      : 0;

    const draft = this.draftsRepo.create({
      tenantId,
      title: dto.title || 'Untitled Draft',
      caseNumber: dto.caseNumber || caseNumber,
      clientName: dto.clientName || '',
      status: dto.status || 'draft',
      category: dto.category || 'criminal',
      assignedTo: dto.assignedTo || '',
      content: dto.content || '',
      wordCount,
      version: 1,
      tags: dto.tags || [dto.category || 'criminal', 'draft'],
      templateId: dto.templateId || undefined,
      createdBy: userId,
    });

    return this.draftsRepo.save(draft);
  }

  async findAll(tenantId: string) {
    return this.draftsRepo.find({
      where: { tenantId },
      order: { updatedAt: 'DESC' },
    });
  }

  async findById(id: string) {
    const draft = await this.draftsRepo.findOne({ where: { id } });
    if (!draft) throw new NotFoundException('Draft not found');
    return draft;
  }

  async update(id: string, dto: Partial<Draft>) {
    const draft = await this.findById(id);
    Object.assign(draft, dto);
    if (dto.content) {
      draft.wordCount = dto.content.trim().split(/\s+/).filter(Boolean).length;
    }
    return this.draftsRepo.save(draft);
  }

  async delete(id: string) {
    const draft = await this.findById(id);
    await this.draftsRepo.remove(draft);
    return { message: 'Draft deleted successfully' };
  }
}
