import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  // Пользователь, давший ответ
  @Column({ type: 'int', nullable: false })
  userId: number;

  // Ссылка на вопрос (ID вопроса)
  @Column({ type: 'int', nullable: false })
  questionId: number;

  // Ссылка на анкету (ID анкеты)
  @Column({ type: 'int', nullable: false })
  questionnaireId: number;

  // Сам ответ пользователя
  @Column({ type: 'text', nullable: false })
  answer: string;

  // Дата создания ответа
  @CreateDateColumn()
  createdAt: Date;
}
