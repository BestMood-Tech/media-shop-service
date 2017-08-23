import { Dynamo, getParams } from '../helper';

export class PromocodeManager extends Dynamo {
  constructor() {
    super();
  }

  public create(id: string, percent: number): Promise<any> {
    const promocode = PromocodeManager.generatePromocode(5);

    const params = getParams('PROMOCODE_TABLE', {
      Item: {
        id,
        promocode,
        percent,
      },
    });

    return this.db.put(params).promise();
  }

  public check(id: string, promocode: string): Promise<number> {
    const params = getParams('PROMOCODE_TABLE', {
      Key: {
        id,
      },
    });

    return this.db.get(params).promise()
      .then((data) => {
        if (data.Item && data.Item.promocode === promocode) {
          return data.Item.percent;
        } else {
          return Promise.reject({ statusCode: 400, message: 'Invalid promocode' });
        }
      });
  }

  public getByUserId(id: string): Promise<PromocodeData> {
    const params = getParams('PROMOCODE_TABLE', {
      Key: {
        id,
      },
    });

    return this.db.get(params).promise().then(data => data.Item);
  }

  public remove(id: string): Promise<any> {
    const params = getParams('PROMOCODE_TABLE', {
      Key: {
        id,
      },
    });

    return this.db.delete(params).promise();
  }

  static generatePromocode(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = 'BESTMOOD-';
    for (let i = 0; i < length; i++) {
      code += possible.charAt(Math.random() * possible.length);
    }
    code += '-TECH';
    return code;
  }
}

export interface PromocodeData {
  id: string
  promocode: string,
  percent: number
}

export interface CreateBody {
  isNewUser: boolean,
  orderCount: number
}

export interface CheckBody {
  promocode: string
}
