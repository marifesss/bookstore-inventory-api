import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { Request, Response } from 'express';

  import { DomainError } from '../../books/domain/errors/domain.error';

  export interface ErrorResponse {
    statusCode: number;
    error: string;
    message: string | string[];
    timestamp: string;
    path: string;
  }

  @Catch()
  export class DomainExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(DomainExceptionFilter.name);

  
    private static readonly STATUS_BY_DOMAIN_CODE: Record<string, number> = {
      INVALID_ISBN: HttpStatus.BAD_REQUEST,
      INVALID_BOOK_DATA: HttpStatus.BAD_REQUEST,
      BOOK_NOT_FOUND: HttpStatus.NOT_FOUND,
      DUPLICATE_ISBN: HttpStatus.CONFLICT,
      EXCHANGE_RATE_UNAVAILABLE: HttpStatus.SERVICE_UNAVAILABLE,
    };

    private static readonly ERROR_BY_STATUS: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
    };

    catch(exception: unknown, host: ArgumentsHost): void {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();

      const { status, error, message } = this.describe(exception);

      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          `${request.method} ${request.url}`,
          exception instanceof Error ? exception.stack : String(exception),
        );
      }

      const body: ErrorResponse = {
        statusCode: status,
        error,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      };

      response.status(status).json(body);
    }

    private describe(exception: unknown): {
      status: number;
      error: string;
      message: string | string[];
    } {
      if (exception instanceof DomainError) {
        const status =
          DomainExceptionFilter.STATUS_BY_DOMAIN_CODE[exception.code] ??
          HttpStatus.INTERNAL_SERVER_ERROR;

        return { status, error: exception.code, message: exception.message };
      }

      if (exception instanceof HttpException) {
        const status = exception.getStatus();
        const payload = exception.getResponse();

        const message =
          typeof payload === 'string'
            ? payload
            : ((payload as { message?: string | string[] }).message ??
              exception.message);

        return {
          status,
          error: DomainExceptionFilter.ERROR_BY_STATUS[status] ?? 'HTTP_ERROR',
          message,
        };
      }

      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      };
    }
  }