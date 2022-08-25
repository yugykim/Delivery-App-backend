import { createRestaurantDto } from './create-restaurant.dto';
import { ArgsType, Field, InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class updateRestaurantInputType extends PartialType(
  createRestaurantDto,
) {}

@InputType()
export class updateRestaurantDto {
  @Field(() => Number)
  id: number;

  @Field(() => updateRestaurantInputType)
  data: updateRestaurantInputType;
}
