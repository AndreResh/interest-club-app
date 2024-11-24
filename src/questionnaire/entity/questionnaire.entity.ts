import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Group } from '../../groups/group.entity';

@Entity()
export class Questionnaire {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string; // Название анкеты

  @OneToOne(() => Group, (group) => group.questionnaire, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  group: Group; // Группа, к которой относится анкета
}
