import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { User } from '../users/user.entity';
import { Chat } from '../chat/entities/chat.entity';
import { mapToUpdate } from '../utils/common';
import { Membership } from '../member-management/membership.entity';
import { UserChat, UserChatRoles } from '../chat/entities/user-chat.entity';

import { CreateGroupDto, UpdateGroupDto } from './types';
import { Group } from './group.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(UserChat)
    private readonly userChatRepository: Repository<UserChat>,
    private readonly dataSource: DataSource,
  ) {}

  async createGroup(createGroupDto: CreateGroupDto): Promise<Group> {
    const queryRunner = this.dataSource.createQueryRunner();

    // Начало новой транзакции
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { userId } = createGroupDto;

      // Поиск пользователя
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`Пользователь с ID ${userId} не найден`);
      }

      // Создание нового чата
      const chat = this.chatRepository.create();
      const savedChat = await queryRunner.manager.save(chat);

      // Создание новой группы, связанной с чатом
      const group = this.groupRepository.create({
        ...createGroupDto,
        chat: savedChat,
      });
      const savedGroup = await queryRunner.manager.save(group);

      // Создание членства пользователя как администратора группы
      const membership = this.membershipRepository.create({
        user: user,
        group: savedGroup,
        isAdmin: true,
      });
      await queryRunner.manager.save(membership);

      // Добавление пользователя как администратора в чат
      const userChat = this.userChatRepository.create({
        user,
        chat,
        role: UserChatRoles.ADMIN,
      });
      await queryRunner.manager.save(userChat);

      // Связывание чата с группой и добавление администратора в массив пользователей чата
      chat.group = group;
      await queryRunner.manager.save(chat);

      // Подтверждение транзакции
      await queryRunner.commitTransaction();

      return savedGroup;
    } catch (error) {
      // Откат транзакции при возникновении ошибки
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Освобождение queryRunner
      await queryRunner.release();
    }
  }

  async getGroupById(id: number): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['chat'],
    });
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return group;
  }

  async getAllGroups(): Promise<Group[]> {
    return this.groupRepository.find({ relations: ['chat'] });
  }

  async updateGroup(
    id: number,
    updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    const group = await this.getGroupById(id);
    mapToUpdate(group, updateGroupDto);
    return this.groupRepository.save(group);
  }

  async deleteGroup(id: number): Promise<void> {
    const result = await this.groupRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
  }
}
