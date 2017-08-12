import * as promocodeFunc from '../api/promocode/handler';
import { expect } from 'chai';
import * as LT from 'lambda-tester';
import { HelperForTests } from './helper';
import { CheckBody, CreateBody } from '../api/promocode/promocode';

const HFT = new HelperForTests();
describe('checking create promocode', () => {

  const demoNewUser: CreateBody = {
    isNewUser: true,
    orderCount: 0
  };

  const demoOldUser: CreateBody = {
    isNewUser: false,
    orderCount: 0
  };

  before((done) => {
    process.env.PROMOCODE_TABLE = 'bmt-media-shop-service-promocode';
    process.env.IS_OFFLINE = 'true';
    HFT.removeItemFromTable(process.env.PROMOCODE_TABLE, done);
  });

  after(() => {
    delete process.env.PROMOCODE_TABLE;
    delete process.env.IS_OFFLINE;
  });

  it('when create promocode for new user', () => {
    return LT(promocodeFunc.create)
      .event({
        path: { id: '1' },
        body: demoNewUser
      })
      .expectResult((result) => {
        expect(result.persent).to.equal(10);
      });
  });

  it('when create promocode for old user without orders', () => {
    return LT(promocodeFunc.create)
      .event({
        path: { id: '1' },
        body: demoOldUser
      })
      .expectError((error) => {
        expect(error.message).to.equal('[400] Not new user must have order count a multiple of five.');
      });
  });

  it('when create promocode for new user with invalid id', () => {
    return LT(promocodeFunc.create)
      .event({
        path: { id: 1 },
        body: demoNewUser
      })
      .expectError();
  });

  it('when create promocode for old user with 5 orders', () => {
    demoOldUser.orderCount = 5;
    return LT(promocodeFunc.create)
      .event({
        path: { id: '1' },
        body: demoOldUser
      })
      .expectResult((result) => {
        expect(result.persent).to.equal(20);
      });
  });

  it('when create promocode for old user with 10 orders', () => {
    demoOldUser.orderCount = 10;
    return LT(promocodeFunc.create)
      .event({
        path: { id: '1' },
        body: demoOldUser
      })
      .expectResult((result) => {
        expect(result.persent).to.equal(30);
      });
  });

  it('when create promocode for old user with 15 orders', () => {
    demoOldUser.orderCount = 15;
    return LT(promocodeFunc.create)
      .event({
        path: { id: '1' },
        body: demoOldUser
      })
      .expectResult((result) => {
        expect(result.persent).to.equal(40);
      });
  });

  it('when create promocode for old user with 20 orders', () => {
    demoOldUser.orderCount = 20;
    return LT(promocodeFunc.create)
      .event({
        path: { id: '1' },
        body: demoOldUser
      })
      .expectResult((result) => {
        expect(result.persent).to.equal(50);
      });
  });

  it('when create promocode for old user more then 20 orders', () => {
    demoOldUser.orderCount = 25;
    return LT(promocodeFunc.create)
      .event({
        path: { id: '1' },
        body: demoOldUser
      })
      .expectResult((result) => {
        expect(result.persent).to.equal(50);
      });
  });

  it('when create promocode for new user and DB is offline', () => {
    delete process.env.IS_OFFLINE;
    return LT(promocodeFunc.create)
      .event({
        path: { id: '1' },
        body: demoNewUser
      })
      .expectError((error) => {
        expect(error.message).to.equal('[500] Server error. Please try later (can not create a promocode)');
      });
  });
});

describe('checking get promocode', () => {
  const demoNewUser: CreateBody = {
    isNewUser: true,
    orderCount: 0
  };

  const demoOldUser: CreateBody = {
    isNewUser: false,
    orderCount: 5
  };

  before((done) => {
    process.env.PROMOCODE_TABLE = 'bmt-media-shop-service-promocode';
    process.env.IS_OFFLINE = 'true';
    HFT.removeItemFromTable(process.env.PROMOCODE_TABLE, done);
  });

  after(() => {
    delete process.env.PROMOCODE_TABLE;
    delete process.env.IS_OFFLINE;
  });

  it('create promocode for new user before get', () => {
    return LT(promocodeFunc.create)
      .event({
        path: { id: '1' },
        body: demoNewUser
      })
      .expectResult((result) => {
        expect(result.persent).to.equal(10);
      });
  });

  it('when get promocode for new user', () => {
    return LT(promocodeFunc.get)
      .event({
        path: { id: '1' }
      })
      .expectResult((result) => {
        expect(result.persent).to.equal(10);
        expect(result.promocode).to.not.equal('');
      });
  });

  it('create promocode for old user before get', () => {
    return LT(promocodeFunc.create)
      .event({
        path: { id: '1' },
        body: demoOldUser
      })
      .expectResult((result) => {
        expect(result.persent).to.equal(20);
      });
  });

  it('when get promocode for old user', () => {
    return LT(promocodeFunc.get)
      .event({
        path: { id: '1' }
      })
      .expectResult((result) => {
        expect(result.persent).to.equal(20);
        expect(result.promocode).to.not.equal('');
      });
  });

  it('when get promocode for user than dont exist', () => {
    return LT(promocodeFunc.get)
      .event({
        path: { id: '2' }
      })
      .expectResult((result) => {
        expect(result.persent).to.equal(0);
        expect(result.promocode).to.equal('');
      });
  });

  it('when get promocode for new user with invalid id', () => {
    return LT(promocodeFunc.get)
      .event({
        path: { id: 1 },
        body: demoNewUser
      })
      .expectError();
  });

  it('when get promocode for new user and DB is offline', () => {
    delete process.env.IS_OFFLINE;
    return LT(promocodeFunc.get)
      .event({
        path: { id: 1 },
        body: demoNewUser
      })
      .expectError((error) => {
        expect(error.message).to.equal('[500] Server error. Please try later (can not get a promocode)')
      });
  });
});

describe('checking remove promocode', () => {
  const demoNewUser: CreateBody = {
    isNewUser: true,
    orderCount: 0
  };

  before((done) => {
    process.env.PROMOCODE_TABLE = 'bmt-media-shop-service-promocode';
    process.env.IS_OFFLINE = 'true';
    HFT.removeItemFromTable(process.env.PROMOCODE_TABLE, done);
  });

  after(() => {
    delete process.env.PROMOCODE_TABLE;
    delete process.env.IS_OFFLINE;
  });

  it('create promocode for new user before get', () => {
    return LT(promocodeFunc.create)
      .event({
        path: { id: '1' },
        body: demoNewUser
      })
      .expectResult((result) => {
        expect(result.persent).to.equal(10);
      });
  });

  it('when delete promocode for new user', () => {
    return LT(promocodeFunc.remove)
      .event({
        path: { id: '1' }
      })
      .expectResult((result) => {
        expect(result.message).to.equal('Promocode is deleted');
      });
  });

  it('when delete promocode for user than dont exist', () => {
    return LT(promocodeFunc.remove)
      .event({
        path: { id: '2' }
      })
      .expectResult((result) => {
        expect(result.message).to.equal('Promocode is deleted');
      });
  });

  it('when delete promocode for new user with invalid id', () => {
    return LT(promocodeFunc.remove)
      .event({
        path: { id: 1 },
        body: demoNewUser
      })
      .expectError();
  });

  it('when delete promocode for user and DB is offline', () => {
    delete process.env.IS_OFFLINE;
    return LT(promocodeFunc.remove)
      .event({
        path: { id: '2' }
      })
      .expectError((error) => {
        expect(error.message).to.equal('[500] Server error. Please try later (can not remove a promocode)');
      });
  });
});

describe('checking check promocode', () => {
  const demoCheck: CheckBody = {
    promocode: ''
  };

  const demoNewUser: CreateBody = {
    isNewUser: true,
    orderCount: 0
  };

  before((done) => {
    process.env.PROMOCODE_TABLE = 'bmt-media-shop-service-promocode';
    process.env.IS_OFFLINE = 'true';
    HFT.removeItemFromTable(process.env.PROMOCODE_TABLE, done);
  });

  after(() => {
    delete process.env.PROMOCODE_TABLE;
    delete process.env.IS_OFFLINE;
  });

  it('create promocode for new user before check', () => {
    return LT(promocodeFunc.create)
      .event({
        path: { id: '1' },
        body: demoNewUser
      })
      .expectResult((result) => {
        expect(result.persent).to.equal(10);
      });
  });

  it('get promocode for new user before check', () => {
    return LT(promocodeFunc.get)
      .event({
        path: { id: '1' }
      })
      .expectResult((result) => {
        expect(result.persent).to.equal(10);
        expect(result.promocode).to.not.equal('');
        demoCheck.promocode = result.promocode;
      });
  });

  it('when check promocode for user', () => {
    return LT(promocodeFunc.check)
      .event({
        path: { id: '1' },
        body: demoCheck
      })
      .expectResult((result) => {
        expect(result.persent).to.equal(10);
      });
  });

  it('when check promocode for user with invalid promocode', () => {
    demoCheck.promocode = '';
    return LT(promocodeFunc.check)
      .event({
        path: { id: '1' },
        body: demoCheck
      })
      .expectError((error) => {
        expect(error.message).to.equal('[400] Invalid promocode');
      });
  });

  it('when check promocode for user without promocode', () => {
    demoCheck.promocode = '';
    return LT(promocodeFunc.check)
      .event({
        path: { id: '1' },
        body: {}
      })
      .expectError((error) => {
        expect(error.message).to.equal('[400] Body must have a promocode.');
      });
  });

  it('when check promocode for new user with invalid id', () => {
    return LT(promocodeFunc.check)
      .event({
        path: { id: 1 },
        body: demoCheck
      })
      .expectError();
  });

  it('when check promocode for new user and DB is offline', () => {
    delete process.env.IS_OFFLINE;
    return LT(promocodeFunc.check)
      .event({
        path: { id: 1 },
        body: demoCheck
      })
      .expectError((error) => {
        expect(error.message).to.equal('[500] Server error. Please try later (can not check a promocode)');
      });
  });
});