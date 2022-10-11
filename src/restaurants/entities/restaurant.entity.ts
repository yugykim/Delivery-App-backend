import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Category } from './category.entity';
import { Dish } from './dish.entity';

//database model
@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType() //graphql schema
@Entity() //For typeOrm
export class Restaurant extends CoreEntity {
  @Field(() => String)
  @Column()
  @Length(5)
  name: string;

  @Field(() => String)
  @Column()
  @IsString()
  coverImage: string;

  @Field(() => String)
  @Column()
  @IsString()
  address: string;

  @Field(() => Number)
  restaurantID: number;

  @Field(() => Category, { nullable: true }) // do not delete restaurant when we delete category
  @ManyToOne(() => Category, (category) => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL', //no category is possible
  })
  category: Category;

  @Field(() => User) // do not delete restaurant when we delete category
  @ManyToOne(() => User, (user) => user.restaurants, { onDelete: 'CASCADE' })
  owner: User;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field(() => [Dish])
  @OneToMany(() => Dish, (Dish) => Dish.restaurant)
  menu: Dish[];
  //restaurnt has many dishes --> one(restaurnt ) many(dish)
}
