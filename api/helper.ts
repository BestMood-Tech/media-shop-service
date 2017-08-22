import { existsSync, readFile, unlink, } from 'fs';
import { DynamoDB } from 'aws-sdk';

export function errorHandler(callback, customMessage?) {
  return (err) => {
    console.log('Function Error: ', err);
    callback(err.statusCode ? `[${err.statusCode}] ${err.message}` : customMessage || '[500] Internal Server Error');
  };
}

export function readFilePromise(filename): Promise<Buffer> {
  return new Promise(function (resolve, reject) {
    readFile(filename, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

export function removeFilePromise(tmpFileLocation): Promise<any> {
  return new Promise(function (resolve, reject) {
    if (!existsSync(tmpFileLocation)) {
      return resolve();
    }
    unlink(tmpFileLocation, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

export function log(...args) {
  if (process.env.IS_OFFLINE) {
    return;
  }
  console.log.apply(console, args);
}

export class Dynamo {
  protected db;

  constructor(IS_OFFLINE?) {
    if (process.env.IS_OFFLINE || IS_OFFLINE) {
      this.db = new DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000/',
      });
    } else {
      this.db = new DynamoDB.DocumentClient();
    }
  }

  static convert(data) {
    return DynamoDB.Converter.unmarshall(data);
  }
}

export function getParams(tableName, params?) {
  return Object.assign({
    TableName: process.env[tableName] as string,
  }, params || {});
}
