import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKnowledgeBaseIndexes1783512000000 implements MigrationInterface {
  name = 'AddKnowledgeBaseIndexes1783512000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_file_intelligence_extracted_text_fts');
    await queryRunner.query('DROP INDEX IF EXISTS idx_file_intelligence_workspace_case');
  }
}
