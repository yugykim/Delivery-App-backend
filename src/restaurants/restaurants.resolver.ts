/* eslint-disable @typescript-eslint/no-empty-function */
import { SetMetadata } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decoratior';
import { User, UserRole } from 'src/users/entities/user.entity';
import {
  createRestaurantInput,
  createRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurant.service';

@Resolver(() => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => createRestaurantOutput)
  async createRestaurant(
    @AuthUser() authUser: User, // owner of the restaurnat is the login user
    @Args('input') createRestaurantInput: createRestaurantInput,
  ): Promise<createRestaurantOutput> {
    return await this.restaurantService.createRestaurant(
      authUser,
      createRestaurantInput,
    );
  }
}
