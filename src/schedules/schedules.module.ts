import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { AuditModule } from '../audit/audit.module';
import { WebhookModule } from '../webhook/webhook.module';

@Module({
  controllers: [SchedulesController],
  providers: [SchedulesService],
  imports: [AuditModule, WebhookModule],
})
export class SchedulesModule {}
