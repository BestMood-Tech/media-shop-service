const uuid = require('uuid');

export class Review {
  public id: string;
  public username: string;
  public rate: number;
  public createDate: string;
  public productID: string;
  public text: string;

  constructor(data) {
      this.id = data.id || uuid.v1();
      this.username = data.username || '';
      this.rate = data.rate || 0;
      this.createDate = data.createDate;
      this.productID = data.productID;
      this.text = data.text;
  }
}