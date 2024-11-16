import { IsInt, IsPositive } from 'class-validator';

export class CreateGroupDto {
  @IsInt()
  @IsPositive()
  userId: number;

  @IsInt()
  @IsPositive()
  groupId: number;
}
