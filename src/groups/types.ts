import {
  IsString,
  IsOptional,
  IsInt,
  IsPositive,
  MaxLength,
  Max,
} from 'class-validator';

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
}
