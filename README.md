# uber eats 

The backend of Delivery App

## Tech stacks 
- NestJS
- Typescript
- TypeORM
- GraphQL
- Heroku 

## Feature
- Unit Testing
- End to End Testing
- JWT Authentication
- Email verification
- Order subscription
- Upload Images with AWS S3 bucket

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

- Restaurant CRUD
- See all categories
- See all Restauratns by Category 
- Search Restaurant

## Order Model
- Order Status
  - Pending
  - Cooking
  - Cooked
  - PickedUp
  - Delived

- Order
  - customer
  - driverId
  - driver
  - restaurant
  - items
  - total
  - status
  
- Order Item Input
  - orderId
  - items
      - dishId
      - options 
        - name
        - choice
        - extra

- Order Item Output
  - orderId

- Dish CRUD
- Orders CRUD
- Orders Subscription 
  - pendingOrders
  - cookedOrders
  - orderUpdates

- takeOrder
- createPayment