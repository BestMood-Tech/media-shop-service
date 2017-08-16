const uuid = require('uuid');

export class Order {
  public id: string;
  public products;
  public total: number;
  public tax: number;
  public currency: string;
  public grandTotal: number;
  public formProfile;
  public addressOrder;
  public createdAt: string;
  public createdBy: string;
  constructor(data) {
    this.id = data.id || uuid.v1();
    this.products = data.products;
    this.total = data.total;
    this.tax = data.tax;
    this.currency = data.total;
    this.grandTotal = data.grandTotal;
    this.formProfile = data.formProfile;
    this.addressOrder = data.addressOrder;
    this.createdAt = data.createdAt;
    this.createdBy = data.createdBy;
  }

}