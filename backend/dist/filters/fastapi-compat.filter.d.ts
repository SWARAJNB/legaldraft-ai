import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
export declare class FastApiCompatFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void;
}
