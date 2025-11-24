import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'usuario@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SenhaSegura123!' })
  @IsString()
  password: string;
}
