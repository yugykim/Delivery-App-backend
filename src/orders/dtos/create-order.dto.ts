import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/output.dto';
import { OrderItemOption } from '../entities/order.item.entity';

@InputType()
class CreateOrderItemInput {
  @Field(() => Int)
  dishId: number;

  @Field(() => [OrderItemOption], { nullable: true })
  options?: OrderItemOption[];
}

@InputType()
export class CreateOrderInput {
  @Field(() => Int)
  restaurantID: number;

  @Field(() => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

@ObjectType()
export class CreateOrderOutput extends MutationOutput {
  @Field(() => Int, { nullable: true })
  orderId?: number;
}
