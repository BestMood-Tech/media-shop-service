import { ProfileManager } from './profile.manager';
import { errorHandler } from '../helper';

export function getAll(event, context, callback) {
  const manager = new ProfileManager();
  manager.getAll()
    .then((data) => callback(null, data))
    .catch(errorHandler(callback));
}

export function findOrCreate(event, context, callback) {
  const [social, id] = event.principalId.split('|');
  const user = event.body;

  console.log('FindOrCreate Profile. Incoming data: ', '\nsocial: ', social, ' id: ', id, '\nbody: ', user);

  const manager = new ProfileManager();

  manager.findOrCreate(id, social, user)
    .then((data) => callback(null, {
      statusCode: 201,
      body: data,
    }))
    .catch(errorHandler(callback));
}

export function update(event, context, callback) {
  const id = event.path.id;
  const body = event.body;

  console.log('Update Profile. Incoming data: ', ' \nid: ', id, '\nbody: ', body);

  const manager = new ProfileManager();

  manager.update(id, body.field, body.value)
    .then(() => callback())
    .catch(err => {
      let message = err.code === 'ConditionalCheckFailedException' ?
        `[404] An item could not be found with id: ${id}` : err.message;
      errorHandler(callback, message)(err);
    });
}