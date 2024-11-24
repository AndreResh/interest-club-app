import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { GroupsModule } from './groups/groups.module';
import { ChatModule } from './chat/chat.module';
import { MemberManagementModule } from './member-management/member-management.module';
import { RequestManagementModule } from './request-management/request-management.module';
import { UsersModule } from './users/users.module';
import { QuestionnaireModule } from './questionnaire/questionnaire.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    GroupsModule,
    ChatModule,
    MemberManagementModule,
    RequestManagementModule,
    UsersModule,
    QuestionnaireModule,
  ],
})
export class AppModule {}
