import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn, JoinColumn,
} from 'typeorm';

import { User } from '../users/user.entity';
import { Group } from '../groups/group.entity';

export enum MembershipStatus {
  ACTIVE = 'active',
  LEFT = 'left',
}

@Entity()
export class Membership {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User; // Участник группы

  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  @JoinColumn()
  group: Group; // Группа, к которой принадлежит участник

  @Column({
    type: 'enum',
    enum: MembershipStatus,
    default: MembershipStatus.ACTIVE,
  })
  status: MembershipStatus;

  @CreateDateColumn()
  joinedAt: Date;

  @Column({ nullable: true })
  leftAt: Date;

  // Определяет, является ли пользователь администратором группы
  @Column({ default: false })
  isAdmin: boolean;
}
