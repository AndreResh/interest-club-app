import { IsInt, IsString, Min, Max, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsInt()
  @Min(1)
  @Max(10)
  rating: number;

  @IsInt()
  groupId: number; // ID кружка
}

export class UpdateReviewDto extends PartialType(CreateReviewDto) {}