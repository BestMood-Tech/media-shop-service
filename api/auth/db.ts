import * as AWS from 'aws-sdk';

const uuid = require('uuid');

const db = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:3000'
});

const getItems = () =>
  new Promise((resolve, reject) => {
    const params = {
      TableName: process.env.USERS_TABLE as string
    };

    db.scan(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve({ items: data.Items });
      }
    });
  });

const getProfileByToken = (socialId, social) =>
  new Promise((resolve, reject) => {
    console.log('id', socialId);
    const params = {
      TableName: process.env.USERS_TABLE as string,
      FilterExpression: "socialId = :socialId and social = :social",
      ExpressionAttributeValues: {
        ":socialId": socialId,
        ":social": social
      }
    };

    db.scan(params, (err, data) => {
      console.log('data', data);
      if (err) {
        reject(err);
      } else if (!data.Items || !data.Items.length) {
        reject({ statusCode: 404, message: `An item could not be found with id: ${socialId}` });
      } else {
        resolve(data.Items[0]);
      }
    });
  });

const getProfile = (socialId, social, user) => {
  return getProfileByToken(socialId, social)
    .then((data) => Promise.resolve(data))
    .catch((err) => {
      if (err.statusCode === 404) {
        return createProfile(socialId, social, user);
      }
      return Promise.reject(err);
    });
};

const createProfile = (socialId, social, userData) =>
  new Promise((resolve, reject) => {
    const params = {
      TableName: process.env.USERS_TABLE as string,
      Item: {
        id: uuid.v1(),
        socialId,
        social,
        firstName: userData.firstName,
        lastName: userData.lastName,
        country: userData.country,
        currency: userData.currency,
        name: userData.name,
        nickName: userData.nickName,
        orders: userData.orders,
        picture: userData.picture,
        address: userData.address
      },
    };

    db.put(params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          statusCode: 201,
          body: params.Item
        });
      }
    });
  });

const updateProfile = (id, field, value) =>
  new Promise((resolve, reject) => {
    const params = {
      TableName: process.env.USERS_TABLE as string,
      ReturnValues: 'NONE',
      ConditionExpression: 'attribute_exists(id)',
      UpdateExpression: `SET #field = :value`,
      Key: {
        id
      },
      ExpressionAttributeNames: {
        '#field': field,
      },
      ExpressionAttributeValues: {
        ':value': value,
      },
    };

    db.update(params, (err) => {
      if (err) {
        if (err.code === 'ConditionalCheckFailedException') {
          reject(new Error(`[404] An item could not be found with id: ${id}`));
        } else {
          reject(err);
        }
      } else {
        resolve();
      }
    });
  });

const deleteProfile = (id) =>
  new Promise((resolve, reject) => {
    const params = {
      TableName: process.env.USERS_TABLE as string,
      ConditionExpression: 'attribute_exists(id)',
      Key: {
        id
      },
    };

    db.delete(params, (err) => {
      if (err) {
        if (err.code === 'ConditionalCheckFailedException') {
          reject(new Error(`[404] An item could not be found with id: ${id}`));
        } else {
          reject(err);
        }
      } else {
        resolve();
      }
    });
  });

export default { getItems, getProfile, createProfile, updateProfile, deleteProfile };
