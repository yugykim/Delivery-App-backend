import { Inject } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decoratior';
import {
  NEW_PENDING_ORDER,
  PUB_SUB,
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
} from 'src/common/common.constants';
import { EditDishOutput } from 'src/restaurants/dtos/edit-dish.dto';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersOutput, GetOrdersInput } from './dtos/get-orders.dto';
import { OrderUpdateInput } from './dtos/order-update.dto';
import { TakeOrderInput, TakeOrderOutput } from './dtos/take-order.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';

@Resolver(() => Order)
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}

  @Mutation(() => CreateOrderOutput)
  @Role(['Customer'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.orderService.createOrder(customer, createOrderInput);
  }

  @Query(() => GetOrdersOutput)
  @Role(['Any'])
  async getOrders(
    @AuthUser() user: User,
    @Args('input') getOrderInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.orderService.getOrders(user, getOrderInput);
  }

  @Query(() => GetOrderOutput)
  async getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderInput: GetOrderInput,
  ): Promise<GetOrdersOutput> {
    return this.orderService.getOrder(user, getOrderInput);
  }

  @Mutation(() => EditDishOutput)
  @Role(['Any'])
  async editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.orderService.editOrder(user, editOrderInput);
  }

  //user order food, and pending order (customer)
  @Subscription(() => Order, {
    filter: ({ pendingOrders: { ownerId } }, _, { user }) => {
      //Inside payload, there in an ownerId, Inside context, there is an User
      return ownerId === user.id; //if it is true, get the orders.
    },
    //pendingOrdrs has order and return order<Obj>. it wasn't objOrder
    resolve: ({ pendingOrders: { order } }) => order,
  })
  @Role(['Owner'])
  pendingOrders() {
    return this.pubsub.asyncIterator(NEW_PENDING_ORDER);
  }

  //cooked order when user is owner.
  @Subscription(() => Order)
  @Role(['Delivery'])
  cookedOrders() {
    return this.pubsub.asyncIterator(NEW_COOKED_ORDER);
  }

  //cooked order when user is owner.
  @Subscription(() => Order, {
    filter: (
      { orderUpdates: order }: { orderUpdates: Order },
      { input }: { input: OrderUpdateInput },
      { user }: { user: User },
    ) => {
      if (
        order.driverId !== user.id &&
        order.customerId !== user.id &&
        order.restaurant.ownerId !== user.id
      ) {
        return false;
      }
      return order.id === input.id;
    },
  })
  @Role(['Any'])
  orderUpdates(@Args('input') orderUpdateInput: OrderUpdateInput) {
    return this.pubsub.asyncIterator(NEW_ORDER_UPDATE);
  }

  @Mutation(() => TakeOrderOutput)
  @Role(['Delivery'])
  takeOrder(
    @AuthUser() driver: User,
    @Args('input') takeOrderInput: TakeOrderInput,
  ): Promise<TakeOrderOutput> {
    return this.orderService.takeOrder(driver, takeOrderInput);
  }
}
