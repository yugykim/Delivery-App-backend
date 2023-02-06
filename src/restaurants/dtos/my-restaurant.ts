import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';
import { MutationOutput } from 'src/common/dtos/output.dto';

@InputType()
export class MyRestaurantInput extends PickType(Restaurant, ['id']) {}

@ObjectType()
export class MyRestaurantOutput extends MutationOutput {
  @Field((type) => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
