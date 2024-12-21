import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { User } from '../users/user.entity';
import { Chat } from '../chat/entity/chat.entity';
import { mapToUpdate } from '../utils/common';
import { Membership } from '../member-management/membership.entity';
import { UserChat, UserChatRoles } from '../chat/entity/user-chat.entity';
import { CacheService } from '../utils/cache.service';

import { CreateGroupDto, SearchGroupDto, UpdateGroupDto } from './types';
import { Group, GroupCategory } from './group.entity';

@Injectable()
export class GroupService {
  private readonly cacheTtl: number;
  
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
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
  ) {
    this.cacheTtl = parseInt(
      this.configService.get<string>('CACHE_TTL_GROUPS', '300'),
      10,
    );
  }

  async createGroup(userId: number, createGroupDto: CreateGroupDto): Promise<Group> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`Пользователь с ID ${userId} не найден`);
      }

      const chat = this.chatRepository.create();
      const savedChat = await queryRunner.manager.save(chat);

      const group = this.groupRepository.create({
        ...createGroupDto,
        chat: savedChat,
      });
      const savedGroup = await queryRunner.manager.save(group);

      const membership = this.membershipRepository.create({
        user: user,
        group: savedGroup,
        isAdmin: true,
      });
      await queryRunner.manager.save(membership);

      const userChat = this.userChatRepository.create({
        user,
        chat,
        role: UserChatRoles.ADMIN,
      });
      await queryRunner.manager.save(userChat);

      chat.group = group;
      await queryRunner.manager.save(chat);

      await queryRunner.commitTransaction();

      return savedGroup;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getGroupById(id: number): Promise<Group> {
    const cacheKey = `group_${id}`;
    const cachedGroup = await this.cacheService.get<Group>(cacheKey);

    if (cachedGroup) {
      return cachedGroup;
    }

    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['chat'],
    });
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    
    await this.cacheService.set(cacheKey, group, this.cacheTtl);

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

    // Удаляем кэш после удаления группы
    await this.cacheService.del(`group_${id}`);
  }

  async searchGroups(searchParams: SearchGroupDto): Promise<Group[]> {
    const cacheKey = `search_groups_${JSON.stringify(searchParams)}`;
    const cachedGroups = await this.cacheService.get<Group[]>(cacheKey);

    if (cachedGroups) {
      return cachedGroups;
    }

    const query = this.groupRepository.createQueryBuilder('group');

    if (searchParams.name) {
      query.andWhere('group.name ILIKE :name', {
        name: `%${searchParams.name}%`,
      });
    }

    if (searchParams.city) {
      query.andWhere('group.city ILIKE :city', {
        city: `%${searchParams.city}%`,
      });
    }

    if (searchParams.location) {
      query.andWhere('group.location ILIKE :location', {
        location: `%${searchParams.location}%`,
      });
    }

    if (searchParams.minAge) {
      query.andWhere('group.minAge >= :minAge', {
        minAge: searchParams.minAge,
      });
    }
    if (searchParams.maxAge) {
      query.andWhere('group.maxAge <= :maxAge', {
        maxAge: searchParams.maxAge,
      });
    }

    if (searchParams.maxMembers) {
      query.andWhere('group.maxMembers >= :maxMembers', {
        maxMembers: searchParams.maxMembers,
      });
    }

    if (searchParams.categories) {
      const categoriesArray = searchParams.categories.split(',').map(category => category.trim());
      const valuesGroupCategory = Object.values(GroupCategory);

      const parsedCategories = categoriesArray.map(category => {
        if (!valuesGroupCategory.includes(category as GroupCategory)) {
          throw new BadRequestException(`Invalid category: ${category}`);
        }
        return category as GroupCategory;
      });

      if (new Set(parsedCategories).size !== parsedCategories.length) {
        throw new BadRequestException('All categories\'s elements must be unique');
      }
      query.andWhere('group.categories && :categories', {
        categories: `{${categoriesArray.join(',')}}`,
      });
    }

    const groups = await query.getMany();
    
    await this.cacheService.set(cacheKey, groups, this.cacheTtl);

    return groups;
  }
}
