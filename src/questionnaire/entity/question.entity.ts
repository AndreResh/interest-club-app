import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { Questionnaire } from './questionnaire.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'text', nullable: false })
  text: string; // Текст вопроса

  @ManyToOne(() => Questionnaire, {
    onDelete: 'CASCADE',
  })
  questionnaire: Questionnaire; // Анкета, к которой относится вопрос

  @Column({ type: 'boolean', default: false })
  isRequired: boolean; // Обязателен ли вопрос для заполнения
}
