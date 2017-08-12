import { AdminPanel } from './admin';

export function createOrder (event, context, callback) {
  const data = event.body;

  console.log('data:', data);

  const adminPanel = new AdminPanel();


  adminPanel.createOrder(data)
    .then((data) => {
      callback(null, data);
    })
    .catch((err) => {
      console.log(err);
      callback(err.statusCode ? `[${err.statusCode}] ${err.message}` : '[500] Internal Server Error');
    });
}

export function getOrders (event, context, callback) {

  const from = event.query.from ? `${event.query.from}-01-01` : '2014-01-01';
  const to = event.query.to ? `${event.query.to}-11-31` : '2017-12-31';

  const adminPanel = new AdminPanel();

  adminPanel.getOrders(from, to)
    .then((data) => {
      callback(null, data)
    })
    .catch((err) => {
      console.log(err);
      callback(err.statusCode ? `[${err.statusCode}] ${err.message}` : '[500] Internal Server Error');
    })

}

export function getOrdersByProfile (event, context, callback) {
  const id = event.query.id;

  console.log('event:', event);
  console.log('id:', id);

  const adminPanel = new AdminPanel();
  adminPanel.getOrdersByProfile(id)
    .then((data) => callback(null, data))
    .catch((err) => {
      callback(err.statusCode ? `[${err.statusCode}] ${err.message}` : '[500] Internal Server Error');
    });
}

export function getOrderById (event, context, callback) {
    const id = event.path.id;

    console.log('event:', event);
    console.log('id:', id);

    const adminPanel = new AdminPanel();
    adminPanel.getOrderById(id)
        .then((data) => callback(null, data))
        .catch((err) => {
            callback(err.statusCode ? `[${err.statusCode}] ${err.message}` : '[500] Internal Server Error');
        });
}


