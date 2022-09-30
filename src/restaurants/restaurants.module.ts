import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurant.service';
import { CategoryResolver, RestaurantsResolver } from './restaurants.resolver';

//in restaurant module, we need restaurant repository
@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Category])],
  providers: [RestaurantsResolver, RestaurantService, CategoryResolver],
})
export class RestaurantsModule {}
