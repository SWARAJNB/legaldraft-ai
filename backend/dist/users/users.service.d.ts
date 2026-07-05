import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
export declare class UsersService {
    private usersRepo;
    constructor(usersRepo: Repository<User>);
    findAll(): Promise<{
        id: string;
        full_name: string;
        email: string;
        role: string;
        created_at: string;
    }[]>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
}
