import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/user.entity';

import { Message } from './message.entity';

@Entity()
export class MessageReadStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Message, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  message: Message;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;
}
