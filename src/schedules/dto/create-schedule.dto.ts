import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty({ example: '2024-12-25T10:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Consulta' })
  @IsString()
  service: string;

  @ApiProperty({
    example: 'PENDING',
    enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED'])
  status?: string;

  @ApiProperty({ example: 'Primeira consulta do pet', required: false })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  petId: number;
}
