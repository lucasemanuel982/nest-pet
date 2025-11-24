import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';

export class UpdateScheduleDto {
  @ApiProperty({ example: '2024-12-25T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: 'Consulta', required: false })
  @IsOptional()
  @IsString()
  service?: string;

  @ApiProperty({
    example: 'CONFIRMED',
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
}
