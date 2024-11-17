import {
  IsString,
  IsOptional,
  IsInt,
  IsPositive,
  MaxLength,
  Max,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
} from 'class-validator';

import { GroupCategory } from './group.entity';

export class CreateGroupDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(255)
  description: string;

  @IsString()
  @MaxLength(255)
  city: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsInt()
  @IsPositive()
  @Max(100)
  maxMembers: number;

  @IsInt()
  @IsPositive()
  minAge: number;

  @IsInt()
  @IsPositive()
  userId: number; // ID пользователя, который создает группу

  @IsInt()
  @IsPositive()
  maxAge: number;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(GroupCategory, { each: true })
  categories: GroupCategory[];
}

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  maxMembers?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  minAge?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  maxAge?: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(GroupCategory, { each: true })
  categories?: GroupCategory[];
}

export class SearchGroupDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  minAge?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  maxAge?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  maxMembers?: number;

  @IsOptional()
  @IsString()
  categories?: string;
}