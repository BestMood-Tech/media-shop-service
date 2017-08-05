import * as AWS from 'aws-sdk';
const uuid = require('uuid');

export class Profile {
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

  public get(socialId: string, social: string, user) {
    return this.getByToken(socialId, social)
      .catch((error) => {
        if (error.statusCode === 404) {
          return this.create(socialId, social, user)
        }
        return Promise.reject(error);
      })
  }

  public update(id, field, value) {
    const params = {
      TableName: process.env.USERS_TABLE as string,
      ReturnValues: 'NONE',
      ConditionExpression: 'attribute_exists(id)',
      UpdateExpression: `SET #field = :value`,
      Key: {
        id
      },
      ExpressionAttributeNames: {
        '#field': field,
      },
      ExpressionAttributeValues: {
        ':value': value,
      },
    };
    return this.db.update(params).promise();
  }

  public getAll() {
    const params = {
      TableName: process.env.USERS_TABLE as string
    };
    return this.db.scan(params).promise();
  }

  private create(socialId, social, userData) {
    const params = {
      TableName: process.env.USERS_TABLE as string,
      Item: {
        id: uuid.v1(),
        socialId,
        social,
        firstName: userData.firstName,
        lastName: userData.lastName,
        country: userData.country,
        currency: userData.currency,
        name: userData.name,
        nickName: userData.nickName,
        orders: userData.orders,
        picture: userData.picture,
        address: userData.address
      },
    };
    console.log('params =', params);
    return this.db.put(params).promise()
      .then(() => Promise.resolve({ statusCode: 201, body: params.Item }))
      .catch((error) => Promise.reject(error));
  }

  private getByToken(socialId: string, social: string) {
    console.log('socialId', socialId);
    const params = {
      TableName: process.env.USERS_TABLE as string,
      FilterExpression: "socialId = :socialId and social = :social",
      ExpressionAttributeValues: {
        ":socialId": socialId,
        ":social": social
      }
    };

    return this.db.scan(params).promise()
      .then((data) => {
        if (data.Count === 0) {
          return Promise.reject({ statusCode: 404, message: `An item could not be found with id: ${socialId}` });
        }
        return data.Items[0];
      });
  }
}