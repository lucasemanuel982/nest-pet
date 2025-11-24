import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class CreatePetDto {
  @ApiProperty({ example: 'Rex' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Dog' })
  @IsString()
  species: string;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(0)
  age: number;

  @ApiProperty({ example: 15.5 })
  @IsNumber()
  @Min(0)
  weight: number;

  @ApiProperty({ example: 'Pet muito brincalhão', required: false })
  @IsOptional()
  @IsString()
  observations?: string;
}
