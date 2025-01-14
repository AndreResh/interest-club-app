import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../users/user.entity';
import { Group } from '../groups/group.entity';

@Entity()
export class Complaint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  reason: string;

  @ManyToOne(() => User, { eager: true })
  user: User; // Пользователь, подавший жалобу

  @ManyToOne(() => User, { nullable: true, eager: true })
  reportedUser: User; // Пользователь, на которого подана жалоба

  @ManyToOne(() => Group, { nullable: true, eager: true })
  group: Group | null; // Кружок, на который подана жалоба

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
