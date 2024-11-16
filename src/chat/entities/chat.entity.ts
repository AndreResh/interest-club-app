import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';

import { Group } from '../../groups/group.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Group, (group) => group.chat)
  @JoinColumn()
  group: Group; // Чат группы
}
