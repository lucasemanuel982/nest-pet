import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

interface AuditLogData {
  action: string;
  details: any;
  userId?: number;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: AuditLogData) {
    return this.prisma.auditLog.create({
      data: {
        action: data.action,
        details: data.details,
        userId: data.userId,
      },
    });
  }

  async findAll(userId?: number) {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    return this.prisma.auditLog.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
    });
  }
}
