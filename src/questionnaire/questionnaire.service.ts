import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';

import { mapToUpdate } from '../utils/common';
import { Group } from '../groups/group.entity';

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
  constructor(
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    private readonly dataSource: DataSource,
  ) {}

  // Создать анкету с массивом вопросов
  async createQuestionnaire(
    createQuestionnaireDto: CreateQuestionnaireDto,
  ): Promise<QuestionnaireResponseDto> {
    const { title, groupId, questions } = createQuestionnaireDto;

    // Начинаем транзакцию
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Проверяем, существует ли группа
      const group = await queryRunner.manager.findOne(Group, {
        where: { id: groupId },
      });
      if (!group) {
        throw new NotFoundException('Group not found');
      }

      // Создаём анкету
      const questionnaire = queryRunner.manager.create(Questionnaire, {
        title,
        group,
      });
      const savedQuestionnaire = await queryRunner.manager.save(
        Questionnaire,
        questionnaire,
      );

      // Привязываем вопросы к анкете
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

      // Обновляем ID анкеты в группе
      group.questionnaire = savedQuestionnaire;
      await queryRunner.manager.save(Group, group);

      // Завершаем транзакцию
      await queryRunner.commitTransaction();

      // Возвращаем DTO с результатом
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
      // Откатываем изменения в случае ошибки
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Закрываем соединение
      await queryRunner.release();
    }
  }

  // Получить анкету по ID
  async getQuestionnaireById(id: number): Promise<QuestionnaireResponseDto> {
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

    return {
      id: questionnaire.id,
      title: questionnaire.title,
      groupId: questionnaire.group.id,
      questions: questions.map((question) => ({
        id: question.id,
        text: question.text,
        isRequired: question.isRequired,
      })),
    };
  }

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

    // Обновляем разрешенные поля анкеты
    mapToUpdate(questionnaire, updateQuestionnaireDto);

    // Работаем с массивом вопросов
    if (updateQuestionnaireDto.questions) {
      const existingQuestions = await this.questionRepository.findBy({
        questionnaire: { id },
      });

      const updatedQuestions = updateQuestionnaireDto.questions.map(
        (question) => {
          if (question.id) {
            // Обновляем существующий вопрос
            const existingQuestion = existingQuestions.find(
              (eq) => eq.id === question.id,
            );
            if (existingQuestion) {
              mapToUpdate(existingQuestion, question);
              return existingQuestion;
            }
          }

          // Добавляем новый вопрос
          return this.questionRepository.create({
            text: question.text,
            isRequired: question.isRequired,
            questionnaire,
          });
        },
      );

      // Удаляем вопросы, которых больше нет в DTO
      const updatedQuestionIds = updatedQuestions
        .map((question) => question.id)
        .filter(Boolean);
      const questionsToRemove = existingQuestions.filter(
        (question) => !updatedQuestionIds.includes(question.id),
      );

      await this.questionRepository.remove(questionsToRemove);
    }

    // Сохраняем обновленную анкету
    const updatedQuestionnaire =
      await this.questionnaireRepository.save(questionnaire);

    const resultQuestions = await this.questionRepository.findBy({
      questionnaire: { id },
    });

    return {
      id: updatedQuestionnaire.id,
      title: updatedQuestionnaire.title,
      groupId: updatedQuestionnaire.group.id,
      questions: resultQuestions.map((question) => ({
        id: question.id,
        text: question.text,
        isRequired: question.isRequired,
      })),
    };
  }

  // Удалить анкету по ID
  async deleteQuestionnaire(id: number): Promise<void> {
    const result = await this.questionnaireRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
  }

  async createAnswers(
    userId: number,
    questionnaireId: number,
    answers: { questionId: number; answer: string }[],
  ): Promise<void> {
    // Проверяем, существует ли анкета
    const questionnaire = await this.questionnaireRepository.findOne({
      where: { id: questionnaireId },
      relations: ['group'],
    });

    if (!questionnaire) {
      throw new NotFoundException(
        `Questionnaire with id ${questionnaireId} not found`,
      );
    }

    // Получаем список всех вопросов анкеты
    const questions = await this.questionRepository.findBy({
      questionnaire: { id: questionnaireId },
    });

    if (questions.length === 0) {
      throw new NotFoundException(
        `No questions found for questionnaire ${questionnaireId}`,
      );
    }

    // Проверяем, все ли обязательные вопросы получили ответы
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

    // Создаём ответы
    const answerEntities = answers.map((a) =>
      this.answerRepository.create({
        userId,
        questionId: a.questionId,
        questionnaireId,
        answer: a.answer,
      }),
    );

    // Сохраняем ответы в базе данных
    await this.answerRepository.save(answerEntities);
  }
}
