import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body, HttpException, HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';
import { UserService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './types';

@Controller('users')
export class UserController {
  constructor(@InjectRepository(User)
              private readonly userRepository: Repository<User>,
              private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    if (await this.userRepository.findOneBy({ email: createUserDto.email })) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }
    return this.userService.createUser(createUserDto);
  }

  @Get(':id')
  async getUserById(@Param('id') id: number): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<void> {
    return this.userService.deleteUser(id);
  }
}
