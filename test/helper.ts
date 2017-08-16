import { config } from 'aws-sdk';
import { Dynamo } from '../api/helper';

export class HelperForTests extends Dynamo {
  constructor() {
    config.update({
      accessKeyId: 'YOURKEY',
      secretAccessKey: 'YOURSECRET',
    });
    super(true);
  }

  public removeItemFromTable(tableName, done?) {
    const params = {
      TableName: tableName,
    };
    this.db.scan(params).promise()
      .then((data: any) => {
        if (data.Count === 0) {
          done();
        }
        data.Items.forEach((item, index) => {
          const params = {
            TableName: tableName,
            ConditionExpression: 'attribute_exists(id)',
            Key: {
              id: item.id,
            },
          };
          this.db.delete(params).promise()
            .then(() => {
              if (data.Count - 1 === index) {
                done();
              }
            });
        });
      });
  }
}