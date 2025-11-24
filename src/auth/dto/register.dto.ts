import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'usuario@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SenhaSegura123!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  name: string;
}
