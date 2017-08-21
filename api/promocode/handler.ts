import { errorHandler, log } from '../helper';
import { CheckBody, CreateBody, PromocodeData, PromocodeManager } from './promocode.manager';

export function create(event, context, callback) {
  const userId = event.path.userId;

  log('userId: ', userId);

  const data: CreateBody = event.body;

  log('data: ', data);

  let percent: number;

  if (data.isNewUser) {
    percent = 10;
  } else {
    let orderRange = data.orderCount / 5;
    if (!data.hasOwnProperty('orderCount') || !orderRange || data.orderCount % 5 !== 0) {
      return callback('[400] Not new user must have order count a multiple of five.');
    }
    switch (orderRange) {
      case 1:
        percent = 20;
        break;
      case 2:
        percent = 30;
        break;
      case 3:
        percent = 40;
        break;
      default:
        percent = 50;
    }
  }

  const promocode: PromocodeManager = new PromocodeManager();

  promocode.create(userId, percent)
    .then((data) => {
      log('------------->', JSON.stringify(data));
      callback(null, { percent: percent })
    })
    .catch(errorHandler(callback, '[500] Server error. Please try later (can not create a promocode)'));
}

export function check(event, context, callback) {
  const userId = event.path.userId;

  log('userId: ', userId);

  const data: CheckBody = event.body;

  log('data: ', data);

  if (!data.hasOwnProperty('promocode')) {
    return callback('[400] Body must have a promocode.');
  }

  const promocode: PromocodeManager = new PromocodeManager();

  promocode.check(userId, data.promocode)
    .then((data) => callback(null, { percent: data }))
    .catch(errorHandler(callback, '[500] Server error. Please try later (can not check a promocode)'));
}

export function get(event, context, callback) {
  const userId = event.path.userId;

  log('userId: ', userId);

  const promocode: PromocodeManager = new PromocodeManager();

  promocode.getByUserId(userId)
    .then((data: PromocodeData) => callback(null,
      {
        promocode: data && data.promocode || '',
        percent: data && data.percent || 0
      }))
    .catch(errorHandler(callback, '[500] Server error. Please try later (can not get a promocode)'));
}

export function remove(event, context, callback) {
  const userId = event.path.userId;

  log('userId:', userId);

  const promocode: PromocodeManager = new PromocodeManager();
  promocode.remove(userId)
    .then(() => callback(null, { message: 'Promocode is deleted' }))
    .catch(errorHandler(callback, '[500] Server error. Please try later (can not remove a promocode)'))
}

