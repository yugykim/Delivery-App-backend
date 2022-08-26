import { Field, ObjectType } from '@nestjs/graphql';

//output
@ObjectType()
export class MutationOutput {
  @Field(() => String, { nullable: true })
  error?: string;
  @Field(() => Boolean)
  ok: boolean;
}
