import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('draft_locks')
export class DraftLock {
  @PrimaryColumn({ name: 'draft_id', type: 'uuid' })
  draftId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'user_name', type: 'varchar', length: 255 })
  userName: string;

  @CreateDateColumn({ name: 'acquired_at' })
  acquiredAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;
}
