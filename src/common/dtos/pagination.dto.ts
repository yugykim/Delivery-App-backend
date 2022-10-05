import { ArgsType, Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { MutationOutput } from './output.dto';

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number;
}

@ObjectType()
export class paginationOutput extends MutationOutput {
  @Field(() => Int, { nullable: true })
  totalPages?: number;

  @Field(() => Int, { nullable: true })
  totalResult?: number;
}
