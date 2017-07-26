import { DynamoDB } from 'aws-sdk';

export class Promocode {

  private db;

  constructor() {
    this.db = new DynamoDB.DocumentClient();
  }

  public create(id: string, social: string, persent: number) {
    const promocode = Promocode.generatePromocode(5);

    const params = {
      TableName: process.env.PROMOCODE_TABLE as string,
      Item: {
        id,
        social,
        promocode,
        persent
      }
    };

    return this.db.put(params).promise();
  }

  public check(id: string, social: string, promocode: string) {
    const params = {
      TableName: process.env.PROMOCODE_TABLE as string,
        Key: {
          id,
          social
      }
    };

    return this.db.get(params).promise()
      .then((data) => {
        if (data.Item.promocode === promocode) {
          return Promise.all([data.Item.persent, this.remove(id, social)])
        } else {
          return Promise.reject({ statusCode: 400, message: 'Invalid promocode'});
        }
      });
  }

  public get(id: string, social: string) {
    const params = {
      TableName: process.env.PROMOCODE_TABLE as string,
      Key: {
        id,
        social
      }
    };

    return this.db.get(params).promise();
  }

  private remove(id: string, social: string) {
    const params = {
      TableName: process.env.PROMOCODE_TABLE as string,
      Key: {
        id,
        social
      }
    };

    return this.db.delete(params).promise();
  }

  public static generatePromocode(length: number): string {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = 'BESTMOOD-';
    for (let i = 0; i < length; i++ ) {
      code += possible.charAt(Math.random() * possible.length)
    }
    code+='-TECH';
    return code;
  }
}
