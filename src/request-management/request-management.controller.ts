import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { RequestService } from './request-management.service';
import { CreateGroupDto } from './types';
import { Request } from './request.entity';

@Controller('requests')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  // Создание новой заявки
  @Post()
  async createRequest(
    @Body() createRequestDto: CreateGroupDto,
  ): Promise<Request> {
    const userId = 1; // из JWT
    return this.requestService.createRequest(userId, createRequestDto);
  }

  // Получение всех заявок для группы
  @Get('group/:groupId')
  async getRequestsForGroup(
    @Param('groupId') groupId: number,
  ): Promise<Request[]> {
    return this.requestService.getRequestsForGroup(groupId);
  }

  // Принятие заявки
  @Put(':id/accept')
  async acceptRequest(@Param('id') id: number): Promise<Request> {
    return this.requestService.acceptRequest(id);
  }

  // Отклонение заявки
  @Put(':id/reject')
  async rejectRequest(@Param('id') id: number): Promise<Request> {
    return this.requestService.rejectRequest(id);
  }

  // Удаление заявки
  @Delete(':id')
  async deleteRequest(@Param('id') id: number): Promise<void> {
    return this.requestService.deleteRequest(id);
  }
}
