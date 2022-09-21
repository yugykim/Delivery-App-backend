import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';
/*InputType is the whole element, 
while Args type is spereating values, and send to GraphQL argument
class-validator
*/
@InputType()
export class createRestaurantInput extends PickType(Restaurant, [
  'name',
  'coverImage',
  'address',
  'restaurantID',
]) {
  @Field(() => String)
  categoryName: string;
}

@ObjectType()
export class createRestaurantOutput extends MutationOutput {}
