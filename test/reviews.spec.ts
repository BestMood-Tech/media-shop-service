import * as reviewsFunc from '../api/reviews/handler';
import { expect } from 'chai';
import * as LT from 'lambda-tester';
import { HelperForTests } from './helper';

const HFT = new HelperForTests();
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

  before((done) => {
    process.env.REVIEWS_TABLE = 'bmt-media-shop-service-table-reviews';
    process.env.IS_OFFLINE = 'true';
    HFT.removeItemFromTable(process.env.REVIEWS_TABLE, done);
  });

  after(() => {
    delete process.env.REVIEWS_TABLE;
    delete process.env.IS_OFFLINE;
  });

  it('when create new review', () => {
    return LT(reviewsFunc.add)
      .event({
        body: demoNewReview
      })
      .expectResult((result) => {
        expect(result.message).to.equal('Success');
      });
  });

  it('when create with invalid date', () => {
    return LT(reviewsFunc.add)
      .event({
        body: demoErrorReview
      })
      .expectError((error) => {
        console.log(error.message);
        expect(error.message).to.equal('[400] Body must have a username.');
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
        path: { productID: null }
      })
      .expectError((error) => {
        console.log(error.message);
        expect(error.message).to.equal('[400] Body must have a productID.');
      })
  });

  it('when create new review when server when DB is not offline', () => {
    delete process.env.IS_OFFLINE;
    return LT(reviewsFunc.add)
      .event({
        body: demoNewReview
      })
      .expectError((error) => {
        expect(error.message).to.equal('[500] Server error. Please try later');
      })
  });

  it('when get review when server when DB is not offline', () => {
    return LT(reviewsFunc.getByProductID)
      .event({
        path: { productID: demoNewReview.productID }
      })
      .expectError((error) => {
        expect(error.message).to.equal('[500] Server error. Please try later');
      })
  });

});