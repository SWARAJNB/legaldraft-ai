import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
export declare class AuthService {
    private usersRepo;
    private jwtService;
    constructor(usersRepo: Repository<User>, jwtService: JwtService);
    register(dto: {
        full_name: string;
        email: string;
        password: string;
        role?: string;
    }): Promise<{
        message: string;
    }>;
    login(dto: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
        token_type: string;
        user: {
            id: string;
            full_name: string;
            email: string;
            role: string;
            created_at: string;
        };
    }>;
    getMe(userId: string): Promise<{
        id: string;
        full_name: string;
        email: string;
        role: string;
        created_at: string;
    }>;
    forgotPassword(dto: {
        email: string;
    }): Promise<{
        message: string;
        otp: string;
    }>;
    verifyOtp(dto: {
        email: string;
        otp: string;
    }): Promise<{
        message: string;
        reset_token: string;
    }>;
    resetPassword(dto: {
        reset_token: string;
        new_password: string;
    }): Promise<{
        message: string;
    }>;
}
