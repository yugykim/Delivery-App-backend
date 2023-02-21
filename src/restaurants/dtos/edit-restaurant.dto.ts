import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/output.dto';
import { createRestaurantInput } from './create-restaurant.dto';
//partialType takes all of property in class, and made optional,and it became
@InputType()
export class EditRestaurantInput extends PartialType(createRestaurantInput) {
  @Field(() => Number)
  restaurantId: number;
}

@ObjectType()
export class EditRestaurantOutput extends MutationOutput {}
