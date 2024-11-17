import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';

import { Group } from './group.entity';
import { GroupService } from './groups.service';
import { CreateGroupDto, SearchGroupDto, UpdateGroupDto } from './types';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  // Создание новой группы
  @Post()
  async createGroup(
    @Body() createGroupDto: CreateGroupDto,
  ): Promise<Group> {
    return this.groupService.createGroup(createGroupDto);
  }

  @Get('search')
  async searchGroups(@Query() searchParams: SearchGroupDto): Promise<Group[]> {
    return this.groupService.searchGroups(searchParams);
  }

  // Получение группы по ID
  @Get(':id')
  async getGroupById(@Param('id') id: number): Promise<Group> {
    return this.groupService.getGroupById(id);
  }

  // Получение всех групп
  @Get()
  async getAllGroups(): Promise<Group[]> {
    return this.groupService.getAllGroups();
  }

  // Обновление группы
  @Put(':id')
  async updateGroup(
    @Param('id') id: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    return this.groupService.updateGroup(id, updateGroupDto);
  }

  // Удаление группы
  @Delete(':id')
  async deleteGroup(@Param('id') id: number): Promise<void> {
    return this.groupService.deleteGroup(id);
  }
}
