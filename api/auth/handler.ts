import { config } from 'dotenv';

const jwt = require('jsonwebtoken');

// Policy helper function
function generatePolicy(principalId, effect, resource) {
  if (!effect || !resource) {
    return {
      principalId: principalId
    };
  }
  return {
    principalId: principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource
      }]
    }
  };
}

// Reusable Authorizer function, set on `authorizer` field in serverless.yml
export function auth(event, context, cb) {
  if (!process.env.AUTH0_CLIENT_ID && process.env.IS_OFFLINE) {
    config();
  }
  if (event.authorizationToken) {
    // remove "bearer " from token
    console.log('event', JSON.stringify(event));
    const token = event.authorizationToken.substring(7);
    const options = {
      audience: process.env.AUTH0_CLIENT_ID,
    };
    const secretBuffer = new Buffer(process.env.AUTH0_CLIENT_SECRET as string, 'base64');
    jwt.verify(token, secretBuffer, options, (err, decoded) => {
      if (err) {
        cb('[401] Unauthorized');
      } else {
        cb(null, generatePolicy(decoded.sub, 'Allow', event.methodArn));
      }
    });
  } else {
    cb('[401] Unauthorized');
  }
}
