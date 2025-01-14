import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';

import { ComplaintsService } from './complaint.service';
import { CreateComplaintDto } from './types';
import { Complaint } from './complaint.entity';

@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  async createComplaint(
    @Body() createComplaintDto: CreateComplaintDto,
  ): Promise<Complaint> {
    const userId = 1; // TODO JWT
    return this.complaintsService.createComplaint(userId, createComplaintDto);
  }

  @Get()
  async getAllComplaints(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.complaintsService.getAllComplaints(page, limit);
  }

  @Get('/group/:groupId')
  async getComplaintsByGroup(
    @Param('groupId') groupId: number,
  ) {
    return this.complaintsService.getComplaintsByGroup(groupId);
  }

  @Get('/user/:userId')
  async getComplaintsByUser(
    @Param('userId') userId: number,
  ) {
    return this.complaintsService.getComplaintsByUser(userId);
  }

  @Delete('/:id')
  async deleteComplaint(@Param('id') id: number): Promise<void> {
    return await this.complaintsService.deleteComplaint(id);
  }
}
