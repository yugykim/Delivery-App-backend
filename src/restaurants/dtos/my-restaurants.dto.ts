import { Field, ObjectType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';
import { MutationOutput } from 'src/common/dtos/output.dto';

@ObjectType()
export class MyRestaurantsOutput extends MutationOutput {
  @Field((type) => [Restaurant])
  restaurants?: Restaurant[];
}
