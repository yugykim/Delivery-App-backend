import { Field, ObjectType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/output.dto';
import { Payment } from '../entities/payment.entities';

@ObjectType()
export class GetPaymentOutput extends MutationOutput {
  @Field(() => [Payment], { nullable: true })
  payments?: Payment[];
}
