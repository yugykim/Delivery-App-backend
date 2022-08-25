import { InputType, OmitType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';
/*InputType is the whole element, 
while Args type is spereating values, and send to GraphQL argument
class-validator
*/
@InputType()
export class createRestaurantDto extends OmitType(
  Restaurant,
  ['id'],
  InputType,
) {}
