import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { v4 as uuidv4 } from 'uuid';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@InputType({ isAbstract: true }) //graphql
@ObjectType() //graphql
@Entity() //database
export class Verification extends CoreEntity {
  //one to one relations
  @Column()
  @Field(() => String)
  code: string;

  //added @OneToOne to the User and specify the target relation type to be User.
  //@JoinColumn which is required and must be set only on one side of the relation. The side you set
  //@JoinColumn on, that side's table will contain a "relation id" and foreign keys to target entity table.
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  // specify whether you want rows deleted in
  //a child table when corresponding rows are deleted in the parent table
  @JoinColumn()
  user: User;

  @BeforeInsert()
  createCode(): void {
    this.code = uuidv4();
    console.log(this.code);
  }
}
