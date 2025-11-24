import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdatePetDto {
  @ApiProperty({ example: 'Rex', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Dog', required: false })
  @IsOptional()
  @IsString()
  species?: string;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

  @ApiProperty({ example: 15.5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiProperty({ example: 'Pet muito brincalhão', required: false })
  @IsOptional()
  @IsString()
  observations?: string;
}
