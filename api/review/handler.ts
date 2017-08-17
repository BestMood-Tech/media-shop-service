import { ReviewManager } from './review.manager';
import { Review } from './review.model';
import { errorHandler, log } from '../helper';

export function add(event, context, callback) {
  const body = event.body;

  log('Add Review. Incoming data: \n', 'body: ', body);

  const manager = new ReviewManager();

  manager.add(body)
    .then((review: Review) => callback(null, review))
    .catch(errorHandler(callback));
}

export function getByProductID(event, context, callback) {
  const productID = event.path.productID;

  log('GetByProductID Review. Incoming data: \n', 'productID: ', productID);

  const manager = new ReviewManager();

  manager.getByProductID(productID)
    .then((result: Review[]) => callback(null, { result }))
    .catch(errorHandler(callback));
}

