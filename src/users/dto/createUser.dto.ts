import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

enum Gender {
  'MALE' = 'male',
  'FEMALE' = 'female',
  'OTHER' = 'other',
}
export class createUser {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsNumber()
  age: number;
  @IsNotEmpty()
  @IsString()
  gender: Gender;
}
