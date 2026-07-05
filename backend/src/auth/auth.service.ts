import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';

// In-memory stores for OTP flow (use Redis in production)
const otpStore = new Map<string, { otp: string; createdAt: number; attempts: number }>();
const resetTokenStore = new Map<string, { email: string; createdAt: number }>();

const OTP_EXPIRY_SECONDS = 300; // 5 minutes
const RESET_TOKEN_EXPIRY_SECONDS = 600; // 10 minutes
const MAX_OTP_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // ── Register ─────────────────────────────────────────────────────────

  async register(dto: {
    full_name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    const email = dto.email.trim().toLowerCase();
    const fullName = dto.full_name.trim();

    if (!fullName) {
      throw new BadRequestException('Full name is required.');
    }

    const allowedRoles = ['admin', 'lawyer', 'legal-assistant'];
    const role = (dto.role || 'lawyer').trim().toLowerCase();
    if (!allowedRoles.includes(role)) {
      throw new BadRequestException(
        `Invalid role. Allowed: ${allowedRoles.sort().join(', ')}`,
      );
    }

    const existing = await this.usersRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
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

  // ── Login ────────────────────────────────────────────────────────────

  async login(dto: { email: string; password: string }) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password.');
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

  // ── Get Current User ─────────────────────────────────────────────────

  async getMe(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Could not validate credentials');
    }
    return {
      id: user.id,
      full_name: user.fullName,
      email: user.email,
      role: user.role,
      created_at: user.createdAt.toISOString(),
    };
  }

  // ── Forgot Password ─────────────────────────────────────────────────

  async forgotPassword(dto: { email: string }) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('No account found with this email address.');
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
      otp: otpCode, // Returned for localhost dev convenience
    };
  }

  // ── Verify OTP ───────────────────────────────────────────────────────

  async verifyOtp(dto: { email: string; otp: string }) {
    const email = dto.email.trim().toLowerCase();
    const submittedOtp = dto.otp.trim();

    const stored = otpStore.get(email);
    if (!stored) {
      throw new BadRequestException(
        'No OTP was requested for this email. Please request a new one.',
      );
    }

    if (Date.now() - stored.createdAt > OTP_EXPIRY_SECONDS * 1000) {
      otpStore.delete(email);
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    if (stored.attempts >= MAX_OTP_ATTEMPTS) {
      otpStore.delete(email);
      throw new HttpException(
        'Too many incorrect attempts. Please request a new OTP.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    stored.attempts += 1;

    if (submittedOtp !== stored.otp) {
      const remaining = MAX_OTP_ATTEMPTS - stored.attempts;
      throw new BadRequestException(
        `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
      );
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

  // ── Reset Password ───────────────────────────────────────────────────

  async resetPassword(dto: { reset_token: string; new_password: string }) {
    const token = dto.reset_token.trim();
    const newPassword = dto.new_password;

    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException(
        'Password must be at least 6 characters long.',
      );
    }

    const stored = resetTokenStore.get(token);
    if (!stored) {
      throw new BadRequestException(
        'Invalid or expired reset token. Please restart the process.',
      );
    }

    if (Date.now() - stored.createdAt > RESET_TOKEN_EXPIRY_SECONDS * 1000) {
      resetTokenStore.delete(token);
      throw new BadRequestException(
        'Reset token has expired. Please restart the process.',
      );
    }

    resetTokenStore.delete(token);

    const user = await this.usersRepo.findOne({
      where: { email: stored.email },
    });
    if (!user) {
      throw new NotFoundException('User account not found.');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await this.usersRepo.save(user);

    console.log('\n' + '='.repeat(60));
    console.log(`  ✅  PASSWORD RESET SUCCESSFUL for: ${stored.email}`);
    console.log(`  🔑  New password has been set (length: ${newPassword.length} chars)`);
    console.log('='.repeat(60) + '\n');

    return {
      message:
        'Password has been reset successfully. You can now log in with your new password.',
    };
  }
}
