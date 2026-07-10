"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddKnowledgeBaseIndexes1783512000000 = void 0;
class AddKnowledgeBaseIndexes1783512000000 {
    constructor() {
        this.name = 'AddKnowledgeBaseIndexes1783512000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_file_intelligence_workspace_case
      ON file_intelligence (workspace_id, case_id)
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_file_intelligence_extracted_text_fts
      ON file_intelligence
      USING GIN (to_tsvector('english', COALESCE(extracted_text, '')))
    `);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP INDEX IF EXISTS idx_file_intelligence_extracted_text_fts');
        await queryRunner.query('DROP INDEX IF EXISTS idx_file_intelligence_workspace_case');
    }
}
exports.AddKnowledgeBaseIndexes1783512000000 = AddKnowledgeBaseIndexes1783512000000;
//# sourceMappingURL=1783512000000-AddKnowledgeBaseIndexes.js.map