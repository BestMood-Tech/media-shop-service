import * as AWS from 'aws-sdk';

export class HelperForTests {
    constructor() {
        AWS.config.update({
            accessKeyId: 'YOURKEY',
            secretAccessKey: 'YOURSECRET'
        });
    }

    public removeItemFromTable(tableName, done?) {

        const db = new AWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000/'
        });

        const params = {
            TableName: tableName
        };
        db.scan(params).promise()
            .then((data: any) => {
                if (data.Count === 0) {
                    done();
                }
                data.Items.forEach((item, index) => {
                    const params = {
                        TableName: tableName,
                        ConditionExpression: 'attribute_exists(id)',
                        Key: {
                            id: item.id
                        }
                    };
                    db.delete(params).promise()
                        .then(() => {
                            if (data.Count - 1 === index) {
                                done();
                            }
                        });
                });
            });
    }
}