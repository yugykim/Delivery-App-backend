import { Field } from '@nestjs/graphql';
import { CreateDateColumn, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export class CoreEntity {
  @PrimaryColumn()
  @Field(() => Number)
  id: number;

  @CreateDateColumn()
  @Field(() => Date)
  createAt: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updateAt: Date;
}
