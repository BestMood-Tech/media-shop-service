import { Profile } from '../profile/profile.model';
const uuid = require('uuid');

export class Order {
  public id: string;
  public products;
  public total: number;
  public tax: number;
  public currency: string;
  public grandTotal: number;
  public payment: string;
  public promocode: string;
  public addressOrder;
  public createdAt: string;
  public createdBy: string | Profile;
  public firstName?: string;
  public lastName?: string;

  constructor(data) {
    this.id = data.id || uuid.v1();
    this.products = data.products;
    this.total = data.total;
    this.tax = data.tax;
    this.currency = data.currency;
    this.grandTotal = data.grandTotal;
    this.payment = data.payment;
    this.promocode = data.promocode;
    this.addressOrder = data.addressOrder;
    this.createdAt = data.createdAt;
    this.createdBy = data.createdBy;
  }

}
