import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface WebhookPayload {
  scheduleId: number;
  oldStatus: string;
  newStatus: string;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly webhookUrl: string;

  constructor(private configService: ConfigService) {
    this.webhookUrl = this.configService.get<string>('WEBHOOK_URL') || '';
  }

  async notifyStatusChange(payload: WebhookPayload): Promise<void> {
    if (!this.webhookUrl) {
      this.logger.warn('WEBHOOK_URL não configurada, pulando notificação');
      return;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        this.logger.error(`Erro ao enviar webhook: ${response.statusText}`);
      } else {
        this.logger.log(
          `Webhook enviado com sucesso para agendamento ${payload.scheduleId}`,
        );
      }
    } catch (error) {
      this.logger.error(`Erro ao enviar webhook: ${error.message}`);
    }
  }
}
