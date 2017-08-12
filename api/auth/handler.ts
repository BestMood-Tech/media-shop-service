import { Profile } from './profile';

const profile = new Profile();

export function getAllProfiles(event, context, callback) {
    profile.getAll()
        .then((data) => callback(null, data.Items))
        .catch((error) => callback(error.statusCode ? `[${error.statusCode}] ${error.message}` : '[500] Internal Server Error'));
}

export function getProfile(event, context, callback) {
    console.log('getProfile', JSON.stringify(event));
    const [social, id] = event.principalId.split('|');
    const user = event.body;
    profile.get(id, social, user)
        .then((data) => {
            callback(null, data);
        })
        .catch((error) => {
            callback(error.statusCode ? `[${error.statusCode}] ${error.message}` : '[500] Server error. Please try later');
        });
}

export function updateProfile(event, context, callback) {
    console.log('updateProfile', JSON.stringify(event.body));
    const id = event.path.id;
    profile.update(id, event.body.field, event.body.value)
        .then(() => callback())
        .catch((error) => callback(error.statusCode ? `[${error.statusCode}] ${error.message}` : '[500] Server error. Please try later'));
}
