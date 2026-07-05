import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: "User's full name", example: 'Rajesh Sharma' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  full_name: string;

  @ApiProperty({ description: "User's email address", example: 'rajesh@lexfirm.in' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password (min 6 characters)', example: 'password123' })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string;

  @ApiProperty({ description: 'User role', example: 'lawyer', default: 'lawyer' })
  @IsString()
  @IsOptional()
  role?: string = 'lawyer';
}

export class LoginDto {
  @ApiProperty({ description: 'Registered email address', example: 'rajesh@lexfirm.in' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Account password', example: 'password123' })
  @IsString()
  @MinLength(1)
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Email address', example: 'rajesh@lexfirm.in' })
  @IsString()
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty({ description: 'Email address' })
  @IsString()
  email: string;

  @ApiProperty({ description: '6-digit OTP code' })
  @IsString()
  otp: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'One-time reset token' })
  @IsString()
  reset_token: string;

  @ApiProperty({ description: 'New password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  new_password: string;
}
