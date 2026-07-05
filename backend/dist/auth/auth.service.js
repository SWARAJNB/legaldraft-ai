"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const user_entity_1 = require("../users/entities/user.entity");
const otpStore = new Map();
const resetTokenStore = new Map();
const OTP_EXPIRY_SECONDS = 300;
const RESET_TOKEN_EXPIRY_SECONDS = 600;
const MAX_OTP_ATTEMPTS = 5;
let AuthService = class AuthService {
    constructor(usersRepo, jwtService) {
        this.usersRepo = usersRepo;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const email = dto.email.trim().toLowerCase();
        const fullName = dto.full_name.trim();
        if (!fullName) {
            throw new common_1.BadRequestException('Full name is required.');
        }
        const allowedRoles = ['admin', 'lawyer', 'legal-assistant'];
        const role = (dto.role || 'lawyer').trim().toLowerCase();
        if (!allowedRoles.includes(role)) {
            throw new common_1.BadRequestException(`Invalid role. Allowed: ${allowedRoles.sort().join(', ')}`);
        }
        const existing = await this.usersRepo.findOne({ where: { email } });
        if (existing) {
            throw new common_1.ConflictException('An account with this email already exists.');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = this.usersRepo.create({
            fullName,
            email,
            passwordHash,
            role,
        });
        await this.usersRepo.save(user);
        console.log(`\n  ✅  New user registered: ${email} (role: ${role})\n`);
        return { message: 'Account created successfully. You can now log in.' };
    }
    async login(dto) {
        const email = dto.email.trim().toLowerCase();
        const user = await this.usersRepo.findOne({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        console.log(`\n  🔐  User logged in: ${email}\n`);
        return {
            access_token: accessToken,
            token_type: 'bearer',
            user: {
                id: user.id,
                full_name: user.fullName,
                email: user.email,
                role: user.role,
                created_at: user.createdAt.toISOString(),
            },
        };
    }
    async getMe(userId) {
        const user = await this.usersRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.UnauthorizedException('Could not validate credentials');
        }
        return {
            id: user.id,
            full_name: user.fullName,
            email: user.email,
            role: user.role,
            created_at: user.createdAt.toISOString(),
        };
    }
    async forgotPassword(dto) {
        const email = dto.email.trim().toLowerCase();
        const user = await this.usersRepo.findOne({ where: { email } });
        if (!user) {
            throw new common_1.NotFoundException('No account found with this email address.');
        }
        const otpCode = String(Math.floor(100000 + Math.random() * 900000));
        otpStore.set(email, { otp: otpCode, createdAt: Date.now(), attempts: 0 });
        console.log('\n' + '='.repeat(60));
        console.log(`  📧  PASSWORD RESET OTP for: ${email}`);
        console.log(`  🔑  OTP Code: ${otpCode}`);
        console.log(`  ⏳  Expires in ${OTP_EXPIRY_SECONDS / 60} minutes`);
        console.log('='.repeat(60) + '\n');
        return {
            message: `A 6-digit OTP has been sent for ${email}.`,
            otp: otpCode,
        };
    }
    async verifyOtp(dto) {
        const email = dto.email.trim().toLowerCase();
        const submittedOtp = dto.otp.trim();
        const stored = otpStore.get(email);
        if (!stored) {
            throw new common_1.BadRequestException('No OTP was requested for this email. Please request a new one.');
        }
        if (Date.now() - stored.createdAt > OTP_EXPIRY_SECONDS * 1000) {
            otpStore.delete(email);
            throw new common_1.BadRequestException('OTP has expired. Please request a new one.');
        }
        if (stored.attempts >= MAX_OTP_ATTEMPTS) {
            otpStore.delete(email);
            throw new common_1.HttpException('Too many incorrect attempts. Please request a new OTP.', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        stored.attempts += 1;
        if (submittedOtp !== stored.otp) {
            const remaining = MAX_OTP_ATTEMPTS - stored.attempts;
            throw new common_1.BadRequestException(`Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
        }
        otpStore.delete(email);
        const resetToken = crypto.randomBytes(36).toString('base64url');
        resetTokenStore.set(resetToken, { email, createdAt: Date.now() });
        console.log(`\n  ✅  OTP verified for ${email}. Reset token issued.\n`);
        return {
            message: 'OTP verified successfully. You may now set a new password.',
            reset_token: resetToken,
        };
    }
    async resetPassword(dto) {
        const token = dto.reset_token.trim();
        const newPassword = dto.new_password;
        if (!newPassword || newPassword.length < 6) {
            throw new common_1.BadRequestException('Password must be at least 6 characters long.');
        }
        const stored = resetTokenStore.get(token);
        if (!stored) {
            throw new common_1.BadRequestException('Invalid or expired reset token. Please restart the process.');
        }
        if (Date.now() - stored.createdAt > RESET_TOKEN_EXPIRY_SECONDS * 1000) {
            resetTokenStore.delete(token);
            throw new common_1.BadRequestException('Reset token has expired. Please restart the process.');
        }
        resetTokenStore.delete(token);
        const user = await this.usersRepo.findOne({
            where: { email: stored.email },
        });
        if (!user) {
            throw new common_1.NotFoundException('User account not found.');
        }
        user.passwordHash = await bcrypt.hash(newPassword, 12);
        await this.usersRepo.save(user);
        console.log('\n' + '='.repeat(60));
        console.log(`  ✅  PASSWORD RESET SUCCESSFUL for: ${stored.email}`);
        console.log(`  🔑  New password has been set (length: ${newPassword.length} chars)`);
        console.log('='.repeat(60) + '\n');
        return {
            message: 'Password has been reset successfully. You can now log in with your new password.',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map