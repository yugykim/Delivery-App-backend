import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteRestaurantInput {
  @Field(() => Number)
  restaurantid: number;
}

@ObjectType()
export class DeleteRestaurantOutput extends MutationOutput {}
