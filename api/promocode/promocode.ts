import * as AWS from 'aws-sdk';

export class Promocode {

  private db;

  constructor() {
      if (process.env.IS_OFFLINE) {
          this.db = new AWS.DynamoDB.DocumentClient({
              region: 'localhost',
              endpoint: 'http://localhost:8000/'
          });
      } else {
          this.db = new AWS.DynamoDB.DocumentClient();
      }
  }

  public create(id: string, persent: number): Promise<any> {
    const promocode = Promocode.generatePromocode(5);

    const params = {
      TableName: process.env.PROMOCODE_TABLE as string,
      Item: {
        id,
        promocode,
        persent
      }
    };

    return this.db.put(params).promise()
      .then((data, err, oneMoreData) => console.log('asdasdasdasd ---------', data, err, oneMoreData));
  }

  public check(id: string, promocode: string): Promise<number> {
    const params = {
      TableName: process.env.PROMOCODE_TABLE as string,
        Key: {
          id
      }
    };

    return this.db.get(params).promise()
      .then((data) => {
        if (data.Item && data.Item.promocode === promocode) {
          return data.Item.persent;
        } else {
          return Promise.reject({ statusCode: 400, message: 'Invalid promocode'});
        }
      });
  }

  public get(id: string): Promise<PromocodeData> {
    const params = {
      TableName: process.env.PROMOCODE_TABLE as string,
      Key: {
        id
      }
    };

    return this.db.get(params).promise();
  }

  public remove(id: string): Promise<any> {
    const params = {
      TableName: process.env.PROMOCODE_TABLE as string,
      Key: {
        id
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

interface PromocodeData {
  Item: {
    id: string
    promocode: string,
    persent: number
  }
}

export interface CreateBody {
  isNewUser: boolean,
  orderCount: number
}

export interface CheckBody {
  promocode: string
}
