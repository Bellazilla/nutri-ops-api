import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async getUser(username: string): Promise<Partial<User> | null> {
    const user = await this.userRepository.findOne({ where: { username } });

    return {
      username: user?.username,
      email: user?.email,
      name: user?.name,
      lastname: user?.lastname,
    };
  }
}
