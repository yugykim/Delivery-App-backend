import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/output.dto';
import {
  PaginationInput,
  paginationOutput,
} from 'src/common/dtos/pagination.dto';
import { Category } from '../entities/category.entity';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class CategoryInput extends PaginationInput {
  @Field(() => String)
  slug: string;
}

@ObjectType()
export class CategoryOutput extends paginationOutput {
  @Field(() => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
  @Field(() => Category, { nullable: true })
  category?: Category;
}
