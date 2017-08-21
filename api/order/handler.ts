import { errorHandler, log } from '../helper';
import { ProfileManager } from '../profile/profile.manager';
import { OrderManager } from './order.manager';

export function createOrder(event, context, callback) {
  const data = event.body;
  const [social, id] = event.principalId.split('|');

  log('Create Order. Incoming data: ', data);

  const manager = new OrderManager();
  const profileManager = new ProfileManager();
  profileManager.getByToken(id, social)
    .then(profile => {
      data.createdAt = (new Date()).toISOString();
      data.createdBy = profile.id;
      return manager.create(data);
    })
    .then((result) => callback(null, result))
    .catch(errorHandler(callback));
}

export function getByRangeDates(event, context, callback) {
  const from = event.query.from ? `${event.query.from}-01-01` : '2014-01-01';
  const to = event.query.to ? `${event.query.to}-11-31` : '2017-12-31';
  const isFake = event.query.isFake;

  log('GetByRangeDates. Incoming data: \n', 'from: ', from, '\n to: ', to, '\n isFake: ', isFake);

  const manager = new OrderManager();
  let promises = [manager.getByRangeDates(from, to)];

  if (isFake) {
    const fakeNumber = OrderManager.randomNumber(100);
    promises.push(OrderManager.makeFakeOrders(fakeNumber))
  }

  Promise.all(promises)
    .then((result) => callback(null, result[0].concat(result[1] || [])))
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


