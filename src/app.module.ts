import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PetsModule } from './pets/pets.module';
import { SchedulesModule } from './schedules/schedules.module';
import { AuditModule } from './audit/audit.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
        const isProduction = nodeEnv === 'production';
        
        return {
          pinoHttp: {
            level: isProduction ? 'info' : 'debug',
            transport: !isProduction
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
                    ignore: 'pid,hostname',
                    singleLine: false,
                  },
                }
              : undefined,
            serializers: {
              req: (req) => ({
                id: req.id,
                method: req.method,
                url: req.url,
              }),
              res: (res) => ({
                statusCode: res.statusCode,
              }),
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    PetsModule,
    SchedulesModule,
    AuditModule,
    WebhookModule,
  ],
})
export class AppModule {}
