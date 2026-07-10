import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ai_conversations')
export class AiConversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'title', type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'tenant_id', type: 'varchar', length: 50 })
  tenantId: string;

  @Column({ name: 'session_type', type: 'varchar', length: 50, default: 'chat' })
  sessionType: string; // chat | guided-draft

  @Column({ name: 'draft_type', type: 'varchar', length: 255, nullable: true })
  draftType: string;

  @Column({ name: 'current_step', type: 'int', default: 0 })
  currentStep: number;

  @Column({ name: 'collected_answers', type: 'jsonb', default: '{}' })
  collectedAnswers: Record<string, any>;

  @Column({ type: 'jsonb', default: '[]' })
  messages: { role: string; content: string; timestamp: string }[];

  @Column({ name: 'is_complete', type: 'boolean', default: false })
  isComplete: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
