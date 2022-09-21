import { InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';
import { createRestaurantInput } from './create-restaurant.dto';
//partialType takes all of property in class, and made optional,and it became
@InputType()
export class EditRestaurantInput extends PartialType(createRestaurantInput) {}

@ObjectType()
export class EditRestaurantOutput extends MutationOutput {}
