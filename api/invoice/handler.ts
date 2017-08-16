import { errorHandler, removeFilePromise, log } from '../helper';
import { OrderManager } from '../order/order.manager';
import { Order } from '../order/order.model';
import { InvoiceManager } from './invioce.manager';
import { ProfileManager } from '../profile/profile.manager';

export async function print(event, context, callback) {
  const orderId = event.path.id;

  log('Print Invoice. Incoming data: \n', 'orderId: ', orderId);

  const manager = new InvoiceManager();

 try {
   await manager.exists(orderId);
   return callback(null, orderId);
 } catch (e) {
   const orderManager = new OrderManager();
   const profileManager = new ProfileManager();

   const order: Order = await orderManager.getById(orderId);
   order.products.forEach(product => {
     product.description = product.description.substr(0, 130).replace(/([\uD800-\uDFFF].)|\n|([^\x00-\x7F])/g, ''),
       product.name = product.name.replace(/([\uD800-\uDFFF].)|([^\x00-\x7F])/g, '');
   });
   order.createdBy = await profileManager.getById(order.createdBy);

   try {
     await manager.printOrder(order, context.awsRequestId);
     await removeFilePromise(InvoiceManager.getFileLocation(orderId));
     callback(null, { id: order.id });
   } catch (err) {
     await removeFilePromise(InvoiceManager.getFileLocation(orderId));
     errorHandler(callback)(err);
   }
 }
}