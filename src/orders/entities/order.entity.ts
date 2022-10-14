import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  RelationId,
} from 'typeorm';
import { OrderItem } from './order.item.entity';

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  Cooked = 'Cooked',
  PickedUp = 'PickedUp',
  Delived = 'Delived',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true }) //graphql
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  customer?: User;

  @RelationId((order: Order) => order.customer)
  customerId: number;

  @RelationId((order: Order) => order.driver)
  driverId: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.rides, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  driver?: User;

  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, (rest) => rest.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  restaurant: Restaurant;

  @Field(() => [OrderItem])
  @ManyToMany(() => OrderItem)
  @JoinTable() //Owner side relationship in ManyToMany
  items: OrderItem[];

  @Column({ nullable: true })
  @Field(() => Float, { nullable: true })
  total: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
  @Field(() => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
