import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsOptional, IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuestionnaireDto {
  @IsNotEmpty()
  @IsString()
  title: string; // Название анкеты

  @IsNotEmpty()
  groupId: number; // ID группы, к которой относится анкета

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[]; // Список вопросов
}

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  text: string; // Текст вопроса

  @IsBoolean()
  isRequired: boolean; // Обязательность вопроса
}

export class QuestionnaireResponseDto {
  id: number;
  title: string;
  groupId: number; // ID группы
  questions: QuestionResponseDto[];
}

export class QuestionResponseDto {
  id: number;
  text: string;
  isRequired: boolean;
}

export class UpdateQuestionnaireDto {
  @IsOptional()
  @IsInt()
  id?: number; // Новый заголовок анкеты

  @IsOptional()
  @IsString()
  title?: string; // Новый заголовок анкеты

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuestionDto)
  questions?: UpdateQuestionDto[]; // Новый список вопросов
}

export class UpdateQuestionDto {
  @IsNotEmpty()
  @IsString()
  text: string; // Новый текст вопроса

  @IsBoolean()
  isRequired: boolean; // Обязательность вопроса

  @IsOptional()
  id?: number; // ID существующего вопроса (для обновления)
}

export class AnswerDto {
  @IsInt()
  questionId: number;

  @IsString()
  answer: string;
}

export class CreateAnswerDto {

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
