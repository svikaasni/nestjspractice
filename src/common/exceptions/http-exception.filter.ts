import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from './domain.exception';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected server error occurred';
    let details: any = null;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        error = exception.name.replace('Exception', '').toUpperCase();
      } else if (typeof res === 'object' && res !== null) {
        const body = res as Record<string, any>;
        message = body.message || exception.message;
        error = body.error || exception.name.replace('Exception', '').toUpperCase();

        if (Array.isArray(body.message)) {
          error = 'VALIDATION_ERROR';
          message = 'Request validation failed';
          details = body.message.map((msg: string) => {
            const parts = msg.split(' ');
            return {
              field: parts[0] || 'input',
              message: msg,
            };
          });
        } else if (body.details) {
          details = body.details;
        }
      }
    } else if (exception instanceof DomainException) {
      statusCode = exception.status;
      error = exception.code;
      message = exception.message;
      details = exception.details;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        statusCode = HttpStatus.CONFLICT;
        error = 'UNIQUE_CONSTRAINT_VIOLATION';
        const target = (exception.meta?.target as string[])?.join(', ') || 'field';
        message = `A resource with this ${target} already exists`;
      } else if (exception.code === 'P2025') {
        statusCode = HttpStatus.NOT_FOUND;
        error = 'RESOURCE_NOT_FOUND';
        message = 'Requested record was not found';
      } else {
        statusCode = HttpStatus.BAD_REQUEST;
        error = 'DATABASE_ERROR';
        message = 'Database operation failed';
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
    }

    response.status(statusCode).json({
      statusCode,
      error,
      message,
      ...(details ? { details } : {}),
      timestamp: new Date().toISOString(),
    });
  }
}
