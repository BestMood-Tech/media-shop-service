import { errorHandler, removeFilePromise, log } from '../helper';
import { OrderManager } from '../order/order.manager';
import { Order } from '../order/order.model';
import { InvoiceManager } from './invioce.manager';

export async function print(event, context, callback) {
  const orderId = event.path.id;

  log('Print Invoice. Incoming data: \n', 'orderId: ', orderId);

  const orderManager = new OrderManager();
  const manager = new InvoiceManager();

  const order: Order = await orderManager.getById(orderId);

  try {
    await manager.printOrder(order, context.awsRequestId);
    await removeFilePromise(InvoiceManager.getFileLocation(order.id));
    callback(null, { id: order.id });
  } catch (err) {
    await removeFilePromise(InvoiceManager.getFileLocation(order.id));
    errorHandler(callback)(err);
  }
}