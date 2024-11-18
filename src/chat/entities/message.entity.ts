import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  OneToMany, JoinColumn,
} from 'typeorm';

import { User } from '../../users/user.entity';

import { Chat } from './chat.entity';
import { MessageReadStatus } from './message-read-status';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  sender: User;

  @ManyToOne(() => Chat, { eager: true })
  @JoinColumn()
  chat: Chat;
  
  @Column({ type: 'varchar', nullable: true })
  mediaUrl?: string; // URL для мультимедиа

  @Column('text')
  content: string;

  @CreateDateColumn()
  sentAt: Date;
}
