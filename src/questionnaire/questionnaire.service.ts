import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { mapToUpdate } from '../utils/common';
import { Group } from '../groups/group.entity';
import { CacheService } from '../utils/cache.service';

import { Questionnaire } from './entity/questionnaire.entity';
import { Question } from './entity/question.entity';
import {
  CreateQuestionnaireDto,
  QuestionnaireResponseDto,
  UpdateQuestionnaireDto,
} from './types';
import { Answer } from './entity/answer.entity';

@Injectable()
export class QuestionnaireService {
  private readonly cacheTtl: number;

  constructor(
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    private readonly dataSource: DataSource,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
  ) {
    this.cacheTtl = parseInt(
      this.configService.get<string>('CACHE_TTL_QUESTIONNAIRE', '300'),
      10,
    );
  }

  // Создать анкету с массивом вопросов
  async createQuestionnaire(
    createQuestionnaireDto: CreateQuestionnaireDto,
  ): Promise<QuestionnaireResponseDto> {
    const { title, groupId, questions } = createQuestionnaireDto;

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const group = await queryRunner.manager.findOne(Group, {
        where: { id: groupId },
      });
      if (!group) {
        throw new NotFoundException('Group not found');
      }

      const questionnaire = queryRunner.manager.create(Questionnaire, {
        title,
        group,
      });
      const savedQuestionnaire = await queryRunner.manager.save(
        Questionnaire,
        questionnaire,
      );

      const questionEntities = questions.map((question) =>
        queryRunner.manager.create(Question, {
          text: question.text,
          isRequired: question.isRequired,
          questionnaire: savedQuestionnaire,
        }),
      );
      const savedQuestions = await queryRunner.manager.save(
        Question,
        questionEntities,
      );

      group.questionnaire = savedQuestionnaire;
      await queryRunner.manager.save(Group, group);

      await queryRunner.commitTransaction();

      return {
        id: savedQuestionnaire.id,
        title: savedQuestionnaire.title,
        groupId,
        questions: savedQuestions.map((question) => ({
          id: question.id,
          text: question.text,
          isRequired: question.isRequired,
        })),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Получить анкету по ID с использованием кэша
  async getQuestionnaireById(id: number): Promise<QuestionnaireResponseDto> {
    const cacheKey = `questionnaire_${id}`;
    const cachedQuestionnaire =
      await this.cacheService.get<QuestionnaireResponseDto>(cacheKey);

    if (cachedQuestionnaire) {
      return cachedQuestionnaire;
    }

    const questionnaire = await this.questionnaireRepository.findOne({
      where: { id },
      relations: ['group'],
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with id ${id} not found`);
    }

    const questions = await this.questionRepository.findBy({
      questionnaire: { id },
    });

    const result: QuestionnaireResponseDto = {
      id: questionnaire.id,
      title: questionnaire.title,
      groupId: questionnaire.group.id,
      questions: questions.map((question) => ({
        id: question.id,
        text: question.text,
        isRequired: question.isRequired,
      })),
    };

    // Сохраняем результат в кэш
    await this.cacheService.set(cacheKey, result, this.cacheTtl);

    return result;
  }

  // Обновить анкету
  async updateQuestionnaire(
    id: number,
    updateQuestionnaireDto: UpdateQuestionnaireDto,
  ): Promise<QuestionnaireResponseDto> {
    const questionnaire = await this.questionnaireRepository.findOne({
      where: { id },
      relations: ['group'],
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with id ${id} not found`);
    }

    mapToUpdate(questionnaire, updateQuestionnaireDto);

    if (updateQuestionnaireDto.questions) {
      const existingQuestions = await this.questionRepository.findBy({
        questionnaire: { id },
      });

      const updatedQuestions = updateQuestionnaireDto.questions.map(
        (question) => {
          if (question.id) {
            const existingQuestion = existingQuestions.find(
              (eq) => eq.id === question.id,
            );
            if (existingQuestion) {
              mapToUpdate(existingQuestion, question);
              return existingQuestion;
            }
          }

          return this.questionRepository.create({
            text: question.text,
            isRequired: question.isRequired,
            questionnaire,
          });
        },
      );

      const updatedQuestionIds = updatedQuestions
        .map((question) => question.id)
        .filter(Boolean);
      const questionsToRemove = existingQuestions.filter(
        (question) => !updatedQuestionIds.includes(question.id),
      );

      await this.questionRepository.remove(questionsToRemove);
    }

    const updatedQuestionnaire =
      await this.questionnaireRepository.save(questionnaire);

    const resultQuestions = await this.questionRepository.findBy({
      questionnaire: { id },
    });

    // Обновляем кэш после изменений
    const result: QuestionnaireResponseDto = {
      id: updatedQuestionnaire.id,
      title: updatedQuestionnaire.title,
      groupId: updatedQuestionnaire.group.id,
      questions: resultQuestions.map((question) => ({
        id: question.id,
        text: question.text,
        isRequired: question.isRequired,
      })),
    };

    await this.cacheService.set(`questionnaire_${id}`, result, this.cacheTtl);

    return result;
  }

  // Удалить анкету
  async deleteQuestionnaire(id: number): Promise<void> {
    const result = await this.questionnaireRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Questionnaire with ID ${id} not found`);
    }

    // Удаляем кэш
    await this.cacheService.del(`questionnaire_${id}`);
  }

  // Сохранить ответы
  async createAnswers(
    userId: number,
    questionnaireId: number,
    answers: { questionId: number; answer: string }[],
  ): Promise<void> {
    const questionnaire = await this.questionnaireRepository.findOne({
      where: { id: questionnaireId },
      relations: ['group'],
    });

    if (!questionnaire) {
      throw new NotFoundException(
        `Questionnaire with id ${questionnaireId} not found`,
      );
    }

    const questions = await this.questionRepository.findBy({
      questionnaire: { id: questionnaireId },
    });

    if (questions.length === 0) {
      throw new NotFoundException(
        `No questions found for questionnaire ${questionnaireId}`,
      );
    }

    const requiredQuestionIds = questions
      .filter((q) => q.isRequired)
      .map((q) => q.id);

    const answeredQuestionIds = answers.map((a) => a.questionId);

    const missingRequiredQuestions = requiredQuestionIds.find(
      (id) => !answeredQuestionIds.includes(id),
    );

    if (missingRequiredQuestions) {
      throw new BadRequestException(
        `Missing answers for required questions: ${missingRequiredQuestions}`,
      );
    }

    const answerEntities = answers.map((a) =>
      this.answerRepository.create({
        userId,
        questionId: a.questionId,
        questionnaireId,
        answer: a.answer,
      }),
    );

    await this.answerRepository.save(answerEntities);
  }
}
