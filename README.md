# uber eats 

the backend of uber eats 

## Tech stacks 
- NestJS
- Typescript
- TypeORM
- GraphQL

## Feature
- Unit Testing
- End to End Testing
- JWT Authentication

## User Entity

- id
- createAt
- updateAt
- email
- password
- role(client|owner|deliver)


## Restaurant Model

- name
- category
- address
- coverImg

- Delete Restaurant
- See categories
- See Restauratns by Category 
- See Restaurant
- Search Restaurant

- Create Dish
- Edit Dish
- Delete Dish

- Orders CRUD
- Orders Subscription 
  - Pending Orders(Owner) (s: newOrder) (t: createOrder(newOrder))
  - Order Status(Owner, Customer, Delivery) (s: orderUpdate) (t: editOrder(orderUpdate))
  - Pending Pickup Order(Delivery) (s: orderUpdate) (t: editOrder(orderUpdate))
- Payments (CRON)