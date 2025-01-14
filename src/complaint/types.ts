import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateComplaintDto {
  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsOptional()
  @IsNumber()
  groupId?: number;

  @IsOptional()
  @IsNumber()
  reportedUserId?: number;
}
