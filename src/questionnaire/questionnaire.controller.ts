import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Put,
} from '@nestjs/common';

import { QuestionnaireService } from './questionnaire.service';
import {
  CreateAnswerDto,
  CreateQuestionnaireDto,
  QuestionnaireResponseDto,
  UpdateQuestionnaireDto,
} from './types';

@Controller('questionnaires')
export class QuestionnaireController {
  constructor(private readonly questionnaireService: QuestionnaireService) {}

  // Создать анкету
  @Post()
  async createQuestionnaire(
    @Body() createQuestionnaireDto: CreateQuestionnaireDto,
  ): Promise<QuestionnaireResponseDto> {
    return await this.questionnaireService.createQuestionnaire(
      createQuestionnaireDto,
    );
  }

  // Обновить анкету
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateQuestionnaireDto: UpdateQuestionnaireDto,
  ) {
    return this.questionnaireService.updateQuestionnaire(
      id,
      updateQuestionnaireDto,
    );
  }

  // Получить анкету по ID
  @Get(':id')
  async getQuestionnaire(
    @Param('id') id: number,
  ): Promise<QuestionnaireResponseDto> {
    return await this.questionnaireService.getQuestionnaireById(id);
  }

  // Удалить анкету по ID
  @Delete(':id')
  async deleteQuestionnaire(@Param('id') id: number): Promise<void> {
    return await this.questionnaireService.deleteQuestionnaire(id);
  }

  // Сохранить ответы пользователя на анкету
  @Post(':id/answers')
  async createAnswers(
    @Param('id') questionnaireId: number,
    @Body() createAnswerDto: CreateAnswerDto,
  ): Promise<void> {
    const { userId, answers } = createAnswerDto;
    await this.questionnaireService.createAnswers(
      userId,
      questionnaireId,
      answers,
    );
  }
}
