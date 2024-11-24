import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Group } from '../groups/group.entity';
import { User } from '../users/user.entity';
import { Membership } from '../member-management/membership.entity';
import { UserChat } from '../chat/entity/user-chat.entity';
import { MemberManagementService } from '../member-management/member-management.service';

import { CreateGroupDto } from './types';
import { Request, RequestStatus } from './request.entity';

@Injectable()
export class RequestService {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly memberManagementService: MemberManagementService,
    private readonly dataSource: DataSource,
  ) {}

  // Создание новой заявки на вступление в группу
  async createRequest(createGroupDto: CreateGroupDto): Promise<Request> {
    const { userId, groupId } = createGroupDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    if (await this.memberManagementService.isUserInGroup(userId, groupId)) {
      throw new BadRequestException(
        `User with ID ${userId} already in group with ID ${groupId}`,
      );
    }

    const isRequestExist = await this.requestRepository.exists({
      where: { group: { id: groupId }, user: { id: userId } },
    });

    if (isRequestExist) {
      throw new BadRequestException(
        'you have already submitted your application',
      );
    }

    const request = this.requestRepository.create({
      user,
      group,
    });

    return this.requestRepository.save(request);
  }

  // Получение всех заявок для группы
  async getRequestsForGroup(groupId: number): Promise<Request[]> {
    return this.requestRepository.find({
      where: { group: { id: groupId } },
      relations: ['user'], // Загружаем информацию о пользователе, подавшем заявку
    });
  }

  // Принятие заявки
  async acceptRequest(requestId: number): Promise<Request> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const request = await queryRunner.manager.findOne(Request, {
        where: { id: requestId },
        relations: ['user', 'group', 'group.chat'],
      });

      if (!request) {
        throw new NotFoundException(`Request with ID ${requestId} not found`);
      }

      if (request.status !== RequestStatus.PENDING) {
        throw new BadRequestException(
          `Request with ID ${requestId} doesn't have correct status`,
        );
      }

      const { user, group } = request;

      // Обновляем статус заявки на "принята"
      request.status = RequestStatus.APPROVED;
      await queryRunner.manager.save(request);

      // Создаем запись в таблице Membership для принятого пользователя
      const membership = queryRunner.manager.create(Membership, {
        user,
        group,
      });
      await queryRunner.manager.save(membership);

      // Добавление пользователя в Chat как Member
      const userChat = queryRunner.manager.create(UserChat, {
        user,
        chat: group.chat,
      });
      await queryRunner.manager.save(userChat);

      // Фиксируем транзакцию
      await queryRunner.commitTransaction();

      return request;
    } catch (error) {
      // Откат транзакции в случае ошибки
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Освобождение QueryRunner
      await queryRunner.release();
    }
  }


  // Отклонение заявки
  async rejectRequest(requestId: number): Promise<Request> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${requestId} not found`);
    }

    request.status = RequestStatus.REJECTED;

    return this.requestRepository.save(request);
  }

  // Удаление заявки
  async deleteRequest(requestId: number): Promise<void> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${requestId} not found`);
    }

    await this.requestRepository.remove(request);
  }
}
