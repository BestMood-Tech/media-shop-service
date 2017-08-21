const uuid = require('uuid');

export class Profile {
  public id: string;
  public socialId: string;
  public social: string;
  public firstName: string;
  public lastName: string;
  public nickName: string;
  public picture: string;
  public country: string;
  public currency: string;
  public email: string;
  public address: string;
  public mobile: string;
  public phone: string;
  public isNew?: boolean;

  constructor(data) {
    this.id = data.id || uuid.v1();
    this.socialId = data.socialId;
    this.social = data.social;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.nickName = data.nickName;
    this.picture = data.picture;
    this.country = data.country;
    this.currency = data.currency;
    this.email = data.email;
    this.address = data.address;
    this.mobile = data.mobile;
    this.phone = data.phone;
  }
}