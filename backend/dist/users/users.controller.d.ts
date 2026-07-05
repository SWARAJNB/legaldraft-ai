import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        id: string;
        full_name: string;
        email: string;
        role: string;
        created_at: string;
    }[]>;
}
