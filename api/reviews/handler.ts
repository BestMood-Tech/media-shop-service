import { Reviews } from './reviews';

export function add(event, context, callback) {
  const data = event.body;
  const requiredNames = [
    'username',
    'rate',
    'productID',
    'createDate',
    'text'
  ];

  requiredNames.forEach((nameField) => {
    if (!data.hasOwnProperty(nameField)) {
      return callback(`[400] Body must have a ${nameField}.`);
    }
  });

  const reviews = new Reviews();
  reviews.add(data)
    .then(() => callback(null, { message: "Success" }))
    .catch((error) => {
      console.log(error);
      return callback(error.statusCode ? `[${error.statusCode}] ${error.message}` : '[500] Server error. Please try later');
    })
}

export function getByProductID(event, context, callback) {
  const reviews = new Reviews();
  if (!event.path.productID) {
    callback('[400] Body must have a productID.');
  }

  reviews.getByProductID(event.path.productID)
    .then((data) => callback(null, { result: data.Items }))
    .catch((error) => {
      console.log(error);
      return callback(error.statusCode ? `[${error.statusCode}] ${error.message}` : '[500] Server error. Please try later');
    })
}



