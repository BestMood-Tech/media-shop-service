const uuid = require('uuid');

export class Profile {
  public id: string;
  public socialId: string;
  public social: string;
  public firstName: string;
  public lastName: string;
  public country: string;
  public currency: string;
  public name: string;
  public nickName: string;
  public picture: string;
  public address: string;

  constructor(data) {
      this.id = data.id || uuid.v1();
      this.socialId = data.socialId;
      this.social = data.social;
      this.firstName = data.firstName;
      this.lastName = data.lastName;
      this.country = data.country;
      this.name = data.name;
      this.currency = data.currency;
      this.nickName = data.nickName;
      this.picture = data.picture;
      this.address = data.address;
    }
}