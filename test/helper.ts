import { config } from 'aws-sdk';
import { Dynamo } from '../api/helper';
import { safeLoad } from 'js-yaml';
import { readFileSync } from 'fs';
import { normalize, join } from 'path';

config.update({
  accessKeyId: 'YOURKEY',
  secretAccessKey: 'YOURSECRET',
});

export class HelperForTests extends Dynamo {
  yaml;
  serverlessFilePath = normalize(join(__dirname, '../serverless.yml'));

  constructor() {
    super(true);
    this.yaml = safeLoad(readFileSync(this.serverlessFilePath, 'utf8'));
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

  public getEnvVar(tableName) {
    return this.yaml.provider.environment[tableName].replace('${self:service}', this.yaml.service);
  }
}