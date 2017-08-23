import { Dynamo, getParams } from '../helper';
import { ProfileManager } from '../profile/profile.manager';
import { PromocodeManager } from '../promocode/promocode.manager';
import { Order } from './order.model';

const faker = require('faker');

export class OrderManager extends Dynamo {
  private profileManager: ProfileManager;

  constructor() {
    super();
    this.profileManager = new ProfileManager();
  }

  /************* Public methods ********* ****/
  public create(orderData): Promise<Order> {
    const order = new Order(orderData);
    const params = getParams('ORDER_TABLE', {
      Item: order,
    });
    return this.db.put(params).promise().then(() => order);
  }

  public getByRangeDates(from: string, to: string): Promise<Order[]> {
    const params = getParams('ORDER_TABLE', {
      FilterExpression: '#createdAt > :from AND #createdAt < :to',
      ExpressionAttributeNames: {
        '#createdAt': 'createdAt',
      },
      ExpressionAttributeValues: {
        ':from': from,
        ':to': to,
      },
    });

    const pOrders = this.db.scan(params).promise().then(data => data.Items.map(item => new Order(item)));

    return Promise.all([this.profileManager.getAll(), pOrders])
      .then(([profiles, orders]) => {
        console.log('data from usersTable = ', profiles);
        console.log('data from ordersTable = ', orders);
        orders.forEach((order: Order) => {
          let profile = profiles.find((profile) => profile.id === order.createdBy);
          if (profile) {
            order.firstName = profile.firstName;
            order.lastName = profile.lastName;
          }
        });
        return orders;
      });
  }

  public getByProfileId(id: string): Promise<Order[]> {
    const params = getParams('ORDER_TABLE', {
      FilterExpression: 'createdBy = :id',
      ExpressionAttributeValues: {
        ':id': id,
      },
    });

    return this.db.scan(params).promise().then(data => data.Items.map(item => new Order(item)));
  }

  public getById(id) {
    const params = getParams('ORDER_TABLE', {
      Key: {
        id,
      },
    });
    return this.db.get(params).promise()
      .then((data) => data.Item);
  }

  /************* Private methods ********* ****/

  /************* Static methods ********* ****/

  static makeFakeOrders(count: number, from?: string, to?: string): Promise<Order[]> {
    let formedOrders: any[] = [];

    for (let i = 0; i < count; i++) {
      const fakeOrder = new Order({
        products: OrderManager.fakeProducts(),
        total: OrderManager.randomNumber(100, 1000),
        promocode: PromocodeManager.generatePromocode(5),
        payment: OrderManager.randomKeyPayment(),
        addressOrder: OrderManager.fakeAddress(),
        createdAt: new Date(faker.date.between(from || '2014-01-01', to || '2017-06-01')),
      });
      fakeOrder.firstName = faker.name.firstName();
      fakeOrder.lastName = faker.name.lastName();
      formedOrders.push(fakeOrder);
    }
    return Promise.resolve(formedOrders);
  }

  static randomNumber(min, max): number {
    return Math.floor(Math.random() * (max + 1) + min);
  }

  static randomKeyType(): string {
    let type = ['music', 'game', 'movie'];
    return type[OrderManager.randomNumber(0, type.length - 1)];
  }

  static randomKeyPayment(): string {
    let payment = ['PayPal', 'CreditCard', 'Cash', 'WebMoney', 'QIWI', 'Bitcoin'];
    return payment[OrderManager.randomNumber(0, payment.length - 1)];
  }

  static fakeAddress(): any {
    return {
      streetAddress: faker.address.streetAddress(),
      addressLine2: faker.address.secondaryAddress(),
      city: faker.address.city(),
      state: faker.address.state(),
      zip: faker.address.zipCode(),
      country: faker.address.country(),
    };
  }

  static fakeProducts(): any[] {
    let products: any[] = [];
    let lastIndex = 2 + OrderManager.randomNumber(0, 10);

    for (let i = 0; i < lastIndex; i++) {
      products.push({
        id: faker.random.number(),
        type: OrderManager.randomKeyType(),
        name: faker.lorem.words(),
        cover: faker.image.imageUrl(),
        description: faker.lorem.paragraph(),
        price: OrderManager.randomNumber(10, 100),
      });
    }
    return products;
  }
}
