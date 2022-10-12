import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('DishChoiceInputType', { isAbstract: true })
@ObjectType()
export class DishChoice {
  @Field(() => String)
  name: string;

  @Field(() => Int, { nullable: true })
  extra?: number;
}

@InputType('DishOptionType', { isAbstract: true })
@ObjectType()
export class DishOption {
  @Field(() => String)
  name: string;

  @Field(() => [DishChoice], { nullable: true })
  choice?: DishChoice[];

  @Field(() => Int, { nullable: true })
  extra?: number;
}

@InputType('DishInputType', { isAbstract: true })
@ObjectType() //graphql schema
@Entity() //For typeOrm
export class Dish extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(() => Int)
  @Column()
  @IsNumber()
  price: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  photo: string;

  @Field(() => String)
  @Column()
  @IsString()
  @Length(10, 140)
  description: string;

  @Field(() => Restaurant) // do not delete restaurant when we delete category
  @ManyToOne(() => Restaurant, (restaurants) => restaurants.menu, {
    onDelete: 'CASCADE', // if rest go away, then the dish should be same
  })
  restaurant: Restaurant;
  //many(dish) to one(restaurant)

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantID: number;

  @Field(() => [DishOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: DishOption[];
}
