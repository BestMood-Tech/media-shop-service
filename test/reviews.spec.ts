import * as reviewsFunc from '../api/review/handler';
import { expect } from 'chai';
import * as LT from 'lambda-tester';
import { HelperForTests } from './helper';

const HFT = new HelperForTests();

function beforeTests(done) {
  process.env.REVIEW_TABLE = HFT.getEnvVar('REVIEW_TABLE');
  process.env.IS_OFFLINE = 'true';
  HFT.removeItemFromTable(process.env.REVIEW_TABLE, done);
}

function afterTests() {
  delete process.env.REVIEW_TABLE;
  delete process.env.IS_OFFLINE;
}

describe('checking work with reviews', () => {
  const demoNewReview = {
    username: 'Test username',
    rate: 5,
    createDate: new Date(),
    productID: 'movies123',
    text: 'Test text review'
  };

  const demoErrorReview = {
    text: 'Error text'
  };

  before(beforeTests);
  after(afterTests);

  it('when create new review', () => {
    return LT(reviewsFunc.add)
      .event({
        body: demoNewReview
      })
      .expectResult((result) => {
        expect(result.username).to.equal('Test username');
      });
  });

  it('when create with invalid date', () => {
    return LT(reviewsFunc.add)
      .event({
        body: demoErrorReview
      })
      .expectError((error) => {
        console.log(error.message);
        expect(error.message).to.equal('[400] One or more parameter values were invalid: An AttributeValue may not contain an empty string');
      })
  });

  it('when get review', () => {
    return LT(reviewsFunc.getByProductID)
      .event({
        path: { productID: demoNewReview.productID }
      })
      .expectResult((result) => {
        expect(result.result[0].text).to.equal('Test text review');
      })
  });

  it('when get review without productID', () => {
    return LT(reviewsFunc.getByProductID)
      .event({
        path: { }
      })
      .expectError((error) => {
        console.log(error.message);
        expect(error.message).to.equal('[400] ExpressionAttributeValues must not be empty');
      })
  });

  it('when create new review when server when DB is not offline', () => {
    delete process.env.IS_OFFLINE;
    return LT(reviewsFunc.add)
      .event({
        body: demoNewReview
      })
      .expectError((error) => {
        console.log(error.message);
        expect(error.message).to.equal('[500] Internal Server Error');
      })
  });

  it('when get review when server when DB is not offline', () => {
    return LT(reviewsFunc.getByProductID)
      .event({
        path: { productID: demoNewReview.productID }
      })
      .expectError((error) => {
        expect(error.message).to.equal('[500] Internal Server Error');
      })
  });

});