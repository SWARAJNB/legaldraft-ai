import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Global exception filter that converts NestJS error responses
 * to match the FastAPI format the frontend expects.
 * 
 * FastAPI format:  { detail: "Error message" }
 * NestJS default:  { message: "Error message", statusCode: 400 }
 * 
 * This filter makes NestJS return { detail: "...", message: "...", statusCode: N }
 * so both `err.detail` and `err.message` work in the frontend.
 */
@Catch()
export class FastApiCompatFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();

      if (typeof exResponse === 'string') {
        message = exResponse;
      } else if (typeof exResponse === 'object' && exResponse !== null) {
        const r = exResponse as Record<string, any>;
        // Handle class-validator array messages
        if (Array.isArray(r.message)) {
          message = r.message.join('. ');
        } else {
          message = r.message || r.error || 'An error occurred';
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      detail: message,       // FastAPI format (frontend reads this)
      message: message,      // NestJS format (also available)
      statusCode: status,
    });
  }
}
