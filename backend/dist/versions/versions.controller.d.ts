import { VersionsService } from './versions.service';
export declare class VersionsController {
    private readonly versionsService;
    constructor(versionsService: VersionsService);
    findAll(draftId: string): Promise<import("./entities/draft-version.entity").DraftVersion[]>;
    create(draftId: string, dto: {
        content: string;
        change_note?: string;
    }, user: {
        id: string;
    }): Promise<import("./entities/draft-version.entity").DraftVersion>;
    restore(draftId: string, versionId: string, user: {
        id: string;
    }): Promise<import("./entities/draft-version.entity").DraftVersion>;
}
