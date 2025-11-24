import {
  ExceptionFilter,
  Catch,
  NotFoundException,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch(NotFoundException)
export class NotFoundFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    response.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Rota não encontrada. Verifique o endereço digitado.',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
