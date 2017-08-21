import { Dynamo, getParams } from '../helper';
import { Profile } from './profile.model';

export class ProfileManager extends Dynamo {
  constructor() {
    super();
  }

  public getAll(): Promise<Profile[]> {
    return this.db.scan(getParams('USER_TABLE', {})).promise()
      .then(data => data.Items.map(item => new Profile(item)));
  }

  public getById(id: string) {
    const params = getParams('USER_TABLE', {
      Key: {
        id,
      },
    });
    return this.db.get(params).promise()
      .then((data) => data.Item);
  }

  public getByToken(socialId: string, social: string): Promise<Profile> {
    const params = getParams('USER_TABLE', {
      FilterExpression: 'socialId = :socialId and social = :social',
      ExpressionAttributeValues: {
        ':socialId': socialId,
        ':social': social,
      },
    });

    return this.db.scan(params).promise()
      .then(data => data.Items.map(item => new Profile(item)))
      .then((profiles: Profile[]) => profiles.pop());
  }

  public findOrCreate(socialId: string, social: string, user: any): Promise<Profile> {
    return this.getByToken(socialId, social)
      .then((data: Profile) => {
        if (data) {
          return Promise.resolve(data);
        } else {
          return this.create(socialId, social, user);
        }
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
      address: userData.address
    });

    const params = getParams('USER_TABLE', {
      Item: profile,
    });

    return this.db.put(params).promise()
      .then(() => {
        profile.isNew = true;
        return profile;
      });
  }

  public update(id: string, field: string, value: any): Promise<any> {
    const params = getParams('USER_TABLE', {
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
}
