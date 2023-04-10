import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from 'src/common/common.constants';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderOutput, GetOrderInput } from './dtos/get-order.dto';
import { GetOrdersOutput, GetOrdersInput } from './dtos/get-orders.dto';
import { TakeOrderInput, TakeOrderOutput } from './dtos/take-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order.item.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}

  async createOrder(
    customer: User,
    { restaurantID, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: {
          id: restaurantID,
        },
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'could not find a restaurant',
        };
      }
      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = []; //making empty array
      for (const item of items) {
        const dish = await this.dishes.findOne(item.dishId);
        if (!dish) {
          // abort this whole thing
          return {
            ok: false,
            error: 'Dish is not found.',
          };
        }
        let dishFinalPrice = dish.price;
        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name,
          );
          if (dishOption) {
            if (dishOption.extra) {
              dishFinalPrice += dishOption.extra;
            } else {
              const dishOptionChoice = dishOption.choice?.find(
                (optionChoice) => optionChoice.name === itemOption.choice,
              );
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  dishFinalPrice += dishOptionChoice.extra;
                }
              }
            }
          }
        }
        orderFinalPrice += dishFinalPrice;
        const orderItem = await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          }),
        );
        orderItems.push(orderItem);
      }
      const order = await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );
      await this.pubsub.publish(NEW_PENDING_ORDER, {
        pendingOrders: {
          order,
          ownerId: restaurant.ownerId,
        },
      });
      return {
        ok: true,
        orderId: order.id,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not make an order.',
      };
    }
  }

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[];
      if (user.role === UserRole.Customer) {
        orders = await this.orders.find({
          where: {
            customer: user,
            ...(status && { status }), //add obj conditionally
          },
        });
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: {
            driver: user,
            ...(status && { status }),
          },
        });
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurants.find({
          where: {
            owner: user,
            ...(status && { status }),
          },
          relations: ['orders'],
        });
        orders = restaurants.map((restaurant) => restaurant.orders).flat(); //map is generated the new array
        if (status) {
          orders = orders.filter((order) => order.status === status); // filter is to eleminate one's not fullfield this conditions
        }
      }
      return {
        ok: true,
        orders,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not get orders',
      };
    }
  }

  canSeeOrder(user: User, order: Order): boolean {
    let canSee = true;
    if (user.role === UserRole.Customer && order.customerId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Delivery && order.driverId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
      canSee = false;
    }
    return canSee;
  }

  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne({
        where: {
          id: orderId,
        },
        relations: ['restaurant'],
      });
      if (!order) {
        return {
          ok: false,
          error: 'Order is not exist',
        };
      }
      return {
        ok: true,
        order,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load order.',
      };
    }
  }

  async editOrder(
    user: User,
    { id: orderId, status }: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      const order = await this.orders.findOne({
        where: {
          id: orderId,
        },
        relations: ['restaurant'],
      });
      if (!order) {
        return {
          ok: false,
          error: 'Order not found',
        };
      }
      let canEdit = true;
      if (user.role === UserRole.Customer) {
        canEdit = false;
      }
      if (user.role === UserRole.Owner) {
        if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
          canEdit = false;
        }
      }
      if (user.role === UserRole.Delivery) {
        if (status !== OrderStatus.PickedUp && status !== OrderStatus.Delived) {
          canEdit = false;
        }
      }
      if (!canEdit) {
        return {
          ok: false,
          error: "You can't do that.",
        };
      }
      await this.orders.save([
        {
          id: orderId,
          status,
        },
      ]);
      const newOrder = { ...order, status };

      if (user.role === UserRole.Owner) {
        if (status === OrderStatus.Cooked) {
          //if user is owner and order status is cooked, pubsub publish order and status
          await this.pubsub.publish(NEW_COOKED_ORDER, {
            cookedOrders: newOrder,
          });
        }
      }
      await this.pubsub.publish(NEW_ORDER_UPDATE, {
        orderUpdates: { ...order, status },
      });
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit an order',
      };
    }
  }

  async takeOrder(
    driver: User,
    { id: orderId }: TakeOrderInput,
  ): Promise<TakeOrderOutput> {
    try {
      const order = await this.orders.findOne({
        where: {
          id: orderId,
        },
      });
      if (!order) {
        return {
          ok: false,
          error: 'Order not found',
        };
      }
      await this.orders.save({
        id: orderId,
        driver,
      });
      await this.pubsub.publish(NEW_ORDER_UPDATE, {
        orderUpdates: { ...order, driver },
      });
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not update the order',
      };
    }
  }
}
