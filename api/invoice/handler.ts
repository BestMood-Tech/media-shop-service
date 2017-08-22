import { errorHandler, log, removeFilePromise } from '../helper';
import { OrderManager } from '../order/order.manager';
import { Order } from '../order/order.model';
import { ProfileManager } from '../profile/profile.manager';
import { InvoiceManager } from './invoice.manager';

export async function print(event, context, callback) {
  const orderId = event.path.id;

  log('Print Invoice. Incoming data: \n', 'orderId: ', orderId);

  const manager = new InvoiceManager();

  try {
    await manager.exists(orderId);
    return callback(null, {id: orderId});
  } catch (e) {
    const orderManager = new OrderManager();
    const profileManager = new ProfileManager();

    let order: Order = await orderManager.getById(orderId);
    order = InvoiceManager.reformatOrderProducts(order);
    order.createdBy = await profileManager.getById(order.createdBy as string);

    try {
      await manager.printOrder(order, context.awsRequestId);
      callback(null, { id: order.id });
    } catch (err) {
      errorHandler(callback)(err);
    } finally {
      await removeFilePromise(InvoiceManager.getFileLocation(orderId));
    }
  }
}
