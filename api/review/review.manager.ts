import { Dynamo, getParams } from '../helper';
import { Review } from './review.model';

export class ReviewManager extends Dynamo {
  constructor() {
    super();
  }

  public create(data): Promise<Review> {
    let review = new Review(data);
    const params = getParams('REVIEW_TABLE', {
      Item: review,
    });
    return this.db.put(params).promise()
      .then(() => review);
  }

  public getByProductID(id): Promise<Review[]> {
    const params = getParams('REVIEW_TABLE', {
      FilterExpression: 'productID = :pID',
      ExpressionAttributeValues: {
        ':pID': id,
      },
    });

    return this.db.scan(params).promise()
      .then((data) => data.Items.map(item => new Review(item)));
  }
}