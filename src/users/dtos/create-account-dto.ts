import { Field, PickType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

export class createAccountInput extends PickType(User, [
  'email',
  'password',
  'role',
]) {}

export class createAccountOutput {
  @Field(() => String, { nullable: true })
  error?: string;
  @Field(() => Boolean)
  ok: boolean;
}
