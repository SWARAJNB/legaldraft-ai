import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, VerifyOtpDto, ResetPasswordDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
    }>;
    login(dto: LoginDto): Promise<{
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
    getMe(user: {
        id: string;
    }): Promise<{
        id: string;
        full_name: string;
        email: string;
        role: string;
        created_at: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
        otp: string;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        message: string;
        reset_token: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
