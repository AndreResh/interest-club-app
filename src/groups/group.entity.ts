import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Chat } from '../chat/entity/chat.entity';
import { Questionnaire } from '../questionnaire/entity/questionnaire.entity';

export enum GroupCategory {
  SPORTS = 'sports',
  ART = 'art',
  MUSIC = 'music',
  EDUCATION = 'education',
  TRAVEL = 'travel',
}

@Entity()
export class Group {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string; // Станция метро или другое уточнение

  @Column({ type: 'int' })
  minAge: number;

  @Column({ type: 'int' })
  maxAge: number;

  @Column({ type: 'int' })
  maxMembers: number; // Максимальное количество участников

  @Column({ type: 'boolean', default: true })
  isOpen: boolean; // Открыт ли набор в группу()

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Chat, (chat) => chat.group, {
    cascade: ['insert', 'update', 'remove'],
  })
  @JoinColumn()
  chat: Chat; // Чат группы

  @OneToOne(() => Questionnaire, (questionnaire) => questionnaire.group, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn()
  questionnaire: Questionnaire; // Анкета группы

  @Column({
    type: 'enum',
    enum: GroupCategory,
    array: true, // Указываем, что это массив
  })
  categories: GroupCategory[]; // Список категорий
}
