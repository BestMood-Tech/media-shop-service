import { Dynamo } from '../helper';
import { Profile } from './profiler.model';

export class ProfileManager extends Dynamo {
  constructor() {
    super();
  }

  public getAll(): Promise<Profile[]> {
    return this.db.scan(ProfileManager.getParams({})).promise()
      .then(data => data.Items.map(item => new Profile(item)));
  }

  public getById(id: string) {
    const params = ProfileManager.getParams({
      Key: {
        id,
      },
    });
    return this.db.get(params).promise()
      .then((data) => data.Item);
  }

  public getByToken(socialId: string, social: string): Promise<Profile> {
    const params = ProfileManager.getParams({
      FilterExpression: 'socialId = :socialId and social = :social',
      ExpressionAttributeValues: {
        ':socialId': socialId,
        ':social': social,
      },
    });

    return this.db.scan(params).promise()
      .then(data => data.Items.map(item => new Profile(item)))
      .then((profiles: Profile[]) => {
        if (!profiles.length) {
          return Promise.reject({ statusCode: 404, message: `An item could not be found with id: ${socialId}` });
        }
        return profiles.pop();
      });
  }

  public findOrCreate(socialId: string, social: string, user: any): Promise<Profile> {
    return this.getByToken(socialId, social)
      .then(data => Promise.resolve(data))
      .catch((err) => {
        if (err.statusCode === 404) {
          return this.create(socialId, social, user);
        }
        return Promise.reject(err);
      });
  }

  public create(socialId: string, social: string, userData: any): Promise<Profile> {
    const profile = new Profile({
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
      address: userData.address,
    });

    const params = ProfileManager.getParams({
      Item: profile,
    });

    return this.db.put(params).promise().then(() => ({
      statusCode: 201,
      body: profile,
    }));
  }

  public update(id: string, field: string, value: any): Promise<any> {
    const params = ProfileManager.getParams({
      ReturnValues: 'NONE',
      ConditionExpression: 'attribute_exists(id)',
      UpdateExpression: `SET #field = :value`,
      Key: {
        id,
      },
      ExpressionAttributeNames: {
        '#field': field,
      },
      ExpressionAttributeValues: {
        ':value': value,
      },
    });

    return this.db.update(params).promise();
  }

  public remove(id: string) {
    const params = ProfileManager.getParams({
      ConditionExpression: 'attribute_exists(id)',
      Key: {
        id,
      },
    });

    return this.db.delete(params).promise();
  }

  static getParams(params?) {
    return Object.assign({
      TableName: process.env.USER_TABLE as string,
    }, params || {});
  }
}