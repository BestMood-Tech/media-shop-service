const faker = require('faker');

import { DynamoDB } from 'aws-sdk';
import { Promocode } from '../promocode/promocode';
import { Profile } from '../auth/profile';

export class AdminPanel {

  private db;
  private user;

  constructor() {
    this.db = new DynamoDB.DocumentClient();
    this.user = new Profile();
  }

  public getOrders (from, to) {

    let formedOrders: any[] = [];

    const paramsOrdersTable = {
      TableName: process.env.ORDERS_TABLE as string
    };

    let lastIndex = AdminPanel.getRandom(500);

    for (let i = 0; i < lastIndex; i++) {
      formedOrders.push({
        items: AdminPanel.getItems(),
        total: AdminPanel.getRandom(1000),
        formProfile: {
          promoCode: Promocode.generatePromocode(5),
          address: AdminPanel.getAddress(),
          payment: AdminPanel.getKeyPayment(),
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName()
        },
        addressOrder: AdminPanel.getAddress(),
        date: new Date(faker.date.between(from, to))
      });
    }

     return Promise.all([this.user.getAll(), this.db.scan(paramsOrdersTable).promise()])
      .then(([profiles, orders]) => {
        console.log('data from usersTable = ', profiles);
        console.log('data from ordersTable = ', orders);
        orders.Items.forEach((order) => {
          let orderedByProfile = profiles.Items.find((profile) => profile.id === order.orderedBy);
          order.formProfile.firstName = orderedByProfile.firstName;
          order.formProfile.lastName = orderedByProfile.lastName;
          formedOrders.push(order);
        });
        return formedOrders;
      });
  }

  public createOrder (orderData) {

      const params = {
        TableName: process.env.ORDERS_TABLE as string,
        Item: orderData
      };

      return this.db.put(params).promise();
  }

  public getOrdersByProfile (id) {
    const params = {
      TableName: process.env.ORDERS_TABLE as string,
      FilterExpression: "orderedBy = :id",
      ExpressionAttributeValues: {
        ":id": id.toString()
      }
    };

    return this.db.scan(params).promise();
  }

  public getOrderById (id) {
    const params = {
      TableName: process.env.ORDERS_TABLE as string,
      Key: {
        id
      },
    };
    return this.db.get(params).promise()
        .then((data) => data.Item);
  }

  private static getRandom (max) {
    return Math.floor(Math.random() * (max + 1));
  }

  private static getKeyType () {
    let type = ['music', 'game', 'movie'];
    return type[AdminPanel.getRandom(type.length-1)];
  }

  private static getKeyPayment () {
    let payment = ['PayPal', 'CreditCard', 'Cash', 'WebMoney', 'QIWI', 'Bitcoin'];
    return payment[AdminPanel.getRandom(payment.length-1)];
  }

  private static getAddress () {
    return {
      streetAddress: faker.address.streetAddress(),
      addressLine2: faker.address.secondaryAddress(),
      city: faker.address.city(),
      state: faker.address.state(),
      zip: faker.address.zipCode(),
      country: faker.address.country()
    }
  }

  private static getItems () {
    let orders: any[] = [];
    let lastIndex = 2 + AdminPanel.getRandom(10);

    for (let i = 0; i < lastIndex; i++) {
      orders.push({
        id: faker.random.number(),
        type: AdminPanel.getKeyType(),
        name: faker.lorem.words(),
        cover: faker.image.imageUrl(),
        description: faker.lorem.paragraph(),
        price: AdminPanel.getRandom(100)
      })
    }
    return orders;
  }
}
