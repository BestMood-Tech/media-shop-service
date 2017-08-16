import { ReviewManager } from './review.manager';
import { Review } from './review.model';
import { errorHandler } from '../helper';

export function add(event, context, callback) {
  const manager = new ReviewManager();
  manager.add(event.body)
    .then((review: Review) => callback(null, review))
    .catch(errorHandler(callback));
}

export function getByProductID(event, context, callback) {
  const manager = new ReviewManager();
  manager.getByProductID(event.path.productID)
    .then((result: Review[]) => callback(null, { result }))
    .catch(errorHandler(callback));
}

