import { Review } from './review.model';
import { Dynamo } from '../helper';

export class ReviewManager extends Dynamo {
  constructor() {
    super();
  }

  public add(data): Promise<Review> {
    let review = new Review(data);
    const params = ReviewManager.getParams({
      Item: review,
    });
    return this.db.put(params).promise()
      .then(() => review);
  }

  public getByProductID(id): Promise<Review[]> {
    const params = ReviewManager.getParams({
      FilterExpression: 'productID = :pID',
      ExpressionAttributeValues: {
        ':pID': id,
      },
    });

    return this.db.scan(params).promise()
      .then((data) => data.Items.map(item => new Review(item)));
  }

  static getParams(params?) {
    return Object.assign({
      TableName: process.env.REVIEW_TABLE as string,
    }, params || {});
  }
}