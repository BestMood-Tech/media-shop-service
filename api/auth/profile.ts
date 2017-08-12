import * as AWS from 'aws-sdk';

const uuid = require('uuid');

export class Profile {

    public get (socialId: string, social: string, user) {
        return this.getByToken(socialId, social)
            .catch((error) => {
                if (error.statusCode === 404) {
                    return this.create(socialId, social, user)
                }
                return Promise.reject(error);
            })
    }

    public update(id, field, value) {
        let db;
        if (process.env.IS_OFFLINE) {
            db = new AWS.DynamoDB.DocumentClient({
                region: 'localhost',
                endpoint: 'http://localhost:8000/'
            });
        } else {
            db = new AWS.DynamoDB.DocumentClient();
        }
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
        return db.update(params).promise();
    }

    public getAll() {
        let db;
        if (process.env.IS_OFFLINE) {
            db = new AWS.DynamoDB.DocumentClient({
                region: 'localhost',
                endpoint: 'http://localhost:8000/'
            });
        } else {
            db = new AWS.DynamoDB.DocumentClient();
        }
        const params = {
            TableName: process.env.USERS_TABLE as string
        };
        return db.scan(params).promise();
    }

    private create(socialId, social, userData) {
        let db;
        if (process.env.IS_OFFLINE) {
            db = new AWS.DynamoDB.DocumentClient({
                region: 'localhost',
                endpoint: 'http://localhost:8000/'
            });
        } else {
            db = new AWS.DynamoDB.DocumentClient();
        }
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
        return db.put(params).promise()
            .then(() => Promise.resolve({statusCode: 201, body: params.Item}))
            .catch((error) => Promise.reject(error));
    }

    private getByToken(socialId: string, social: string) {
        let db;
        if (process.env.IS_OFFLINE) {
            db = new AWS.DynamoDB.DocumentClient({
                region: 'localhost',
                endpoint: 'http://localhost:8000/'
            });
        } else {
            db = new AWS.DynamoDB.DocumentClient();
        }
        const params = {
            TableName: process.env.USERS_TABLE as string,
            FilterExpression: 'socialId = :socialId and social = :social',
            ExpressionAttributeValues: {
                ':socialId': socialId,
                ':social': social
            }
        };

        return db.scan(params).promise()
            .then((data) => {
                if (data.Count === 0) {
                    return Promise.reject({
                        statusCode: 404,
                        message: `An item could not be found with id: ${socialId}`
                    });
                }
                return data.Items[0];
            });
    }
}