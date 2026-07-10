import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DraftVersion } from './entities/draft-version.entity';

@Injectable()
export class VersionsService {
  constructor(
    @InjectRepository(DraftVersion)
    private versionsRepo: Repository<DraftVersion>,
  ) {}

  async findByDraftId(draftId: string) {
    return this.versionsRepo.find({
      where: { draftId },
      order: { versionNumber: 'DESC' },
    });
  }

  async createVersion(draftId: string, content: string, savedBy: string, changeNote?: string) {
    const lastVersion = await this.versionsRepo.findOne({
      where: { draftId },
      order: { versionNumber: 'DESC' },
    });

    const nextVersion = lastVersion ? lastVersion.versionNumber + 1 : 1;

    const version = this.versionsRepo.create({
      draftId,
      versionNumber: nextVersion,
      content,
      savedBy,
      changeNote: changeNote || `Version ${nextVersion}`,
    });

    return this.versionsRepo.save(version);
  }

  async restore(draftId: string, versionId: string, savedBy: string) {
    const version = await this.versionsRepo.findOne({ where: { id: versionId, draftId } });
    if (!version) throw new NotFoundException('Version not found');

    // Create a NEW version with the old content (append-only, never delete)
    return this.createVersion(
      draftId,
      version.content,
      savedBy,
      `Restored from version ${version.versionNumber}`,
    );
  }

  async compareVersions(draftId: string, versionA: string, versionB: string) {
    const a = await this.versionsRepo.findOne({ where: { id: versionA, draftId } });
    const b = await this.versionsRepo.findOne({ where: { id: versionB, draftId } });
    if (!a || !b) throw new NotFoundException('Version not found');
    return { versionA: a, versionB: b };
  }
}
