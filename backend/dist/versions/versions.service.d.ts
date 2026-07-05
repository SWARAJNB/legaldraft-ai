import { Repository } from 'typeorm';
import { DraftVersion } from './entities/draft-version.entity';
export declare class VersionsService {
    private versionsRepo;
    constructor(versionsRepo: Repository<DraftVersion>);
    findByDraftId(draftId: string): Promise<DraftVersion[]>;
    createVersion(draftId: string, content: string, savedBy: string, changeNote?: string): Promise<DraftVersion>;
    restore(draftId: string, versionId: string, savedBy: string): Promise<DraftVersion>;
    compareVersions(draftId: string, versionA: string, versionB: string): Promise<{
        versionA: DraftVersion;
        versionB: DraftVersion;
    }>;
}
