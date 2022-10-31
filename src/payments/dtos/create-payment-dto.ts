import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/output.dto';
import { Payment } from '../entities/payment.entities';

@InputType()
export class CreatePaymentInput extends PickType(Payment, ['transactionId']) {
  @Field(() => Int)
  restaurantID: number;
}

@ObjectType()
export class CreatePaymentOuput extends MutationOutput {}
