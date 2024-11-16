import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

import { User } from '../../users/user.entity';

import { Chat } from './chat.entity';

export enum UserChatRoles {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER',
}

@Entity()
export class UserChat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Chat, (chat) => chat.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  // Роль пользователя в чате
  @Column({
    type: 'enum',
    enum: UserChatRoles,
    default: UserChatRoles.MEMBER,
  })
  role: UserChatRoles;

  // Время вступления в чат
  @CreateDateColumn()
  joinedAt: Date;
}
