import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async findAll() {
    const users = await this.usersRepo.find({
      order: { createdAt: 'DESC' },
    });
    return users.map((u) => ({
      id: u.id,
      full_name: u.fullName,
      email: u.email,
      role: u.role,
      created_at: u.createdAt.toISOString(),
    }));
  }

  async findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }
}
