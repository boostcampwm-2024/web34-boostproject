import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    ForbiddenException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { BusinessException, EntityNotExistException, InvalidSessionException, SessionAlreadyAssignedException } from './errors';

@Catch()
export class LastExceptionFilter implements ExceptionFilter {
    protected readonly logger = new Logger(this.constructor.name);

    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const { httpAdapter } = this.httpAdapterHost;

        const ctx = host.switchToHttp();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
        };

        if (this.constructor.name === 'LastExceptionFilter') {
            if (exception instanceof HttpException) {
                this.logger.log(exception);
            } else {
                this.logger.error(exception);
            }
        }

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}

@Catch(BusinessException)
export class BusinessExceptionsFilter extends LastExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        this.logger.log(exception);

        if (exception instanceof SessionAlreadyAssignedException) {
            super.catch(new ForbiddenException(exception), host);
            return;
        }

        if (exception instanceof EntityNotExistException) {
            super.catch(new NotFoundException(exception), host);
            return;
        }

        if (exception instanceof InvalidSessionException) {
            super.catch(new ForbiddenException(exception), host);
            return;
        }
        super.catch(exception, host);
    }
}
