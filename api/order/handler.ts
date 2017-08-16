import { OrderManager } from './order.manager';
import { errorHandler, log } from '../helper';

export function createOrder(event, context, callback) {
  const data = event.body;

  log('Create Order. Incoming data: ', data);

  const manager = new OrderManager();
  manager.create(data)
    .then((data) => callback(null, data))
    .catch(errorHandler(callback));
}

export function getByRangeDates(event, context, callback) {
  const from = event.query.from ? `${event.query.from}-01-01` : '2014-01-01';
  const to = event.query.to ? `${event.query.to}-11-31` : '2017-12-31';
  const fakeNumber = OrderManager.randomNumber(100);

  log('GetByRangeDates. Incoming data: \n', 'from: ', from, '\n to: ', to);

  const manager = new OrderManager();

  Promise.all([manager.getByRangeDates(from, to), OrderManager.makeFakeOrders(fakeNumber)])
    .then(([dbOrders, fakeOrders]) => callback(null, dbOrders.concat(fakeOrders)))
    .catch(errorHandler(callback));
}

export function getByProfileId(event, context, callback) {
  const id = event.path.id;

  log('GetByProfileId. Incoming data: \n', 'id: ', id);

  const manager = new OrderManager();
  manager.getByProfileId(id)
    .then((data) => callback(null, data))
    .catch(errorHandler(callback));
}

export function getById(event, context, callback) {
  const id = event.path.id;
  log('GetById. Incoming data: \n', 'id: ', id);

  const manager = new OrderManager();
  manager.getById(id)
    .then((data) => callback(null, data))
    .catch(errorHandler(callback));
}


