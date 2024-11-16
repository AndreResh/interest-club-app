import { Controller, Get, Param } from '@nestjs/common';

import { MemberManagementService } from './member-management.service';

@Controller('members')
export class MemberManagementController {
  constructor(
    private readonly memberManagementService: MemberManagementService,
  ) {}

  // Получение всех участников кружка
  @Get('membership/:groupId')
  getMembersForGroup(@Param('groupId') groupId: number) {
    return this.memberManagementService.getMembersForGroup(groupId);
  }
}
