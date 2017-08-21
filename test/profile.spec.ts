import { expect } from 'chai';
import * as LT from 'lambda-tester';
import * as profileFunc from '../api/profile/handler';
import { HelperForTests } from './helper';

const HFT = new HelperForTests();

function beforeTests(done) {
  process.env.USER_TABLE = HFT.getEnvVar('USER_TABLE');
  process.env.IS_OFFLINE = 'true';
  HFT.removeItemFromTable(process.env.USER_TABLE, done);
}

function afterTests() {
  delete process.env.USER_TABLE;
  delete process.env.IS_OFFLINE;
}

describe('checking add and get profile in db', () => {

  const demoProfile = HFT.getFakeProfile();

  before(beforeTests);
  after(afterTests);

  it('when create profile with empty field', () => {
    const tmp = HFT.getFakeProfile();
    tmp.currency = '';

    return LT(profileFunc.findOrCreate)
      .event({
        principalId: 'vkontakte|95851704',
        body: tmp,
      })
      .expectError();
  });

  it('when create profile', () => {
    return LT(profileFunc.findOrCreate)
      .event({
        principalId: 'vkontakte|95851704',
        body: demoProfile,
      })
      .expectResult((result) => {
        delete result.id;
        expect(result).to.exist;
        expect(result.isNew).to.equal(true);
        delete result.isNew;
        for (const key in result) {
          expect(result[key]).to.equal(demoProfile[key]);
        }
      });
  });

  it('when create profile but this profile is exist in db', () => {
    return LT(profileFunc.findOrCreate)
      .event({
        principalId: 'vkontakte|95851704',
        body: demoProfile,
      })
      .expectResult((result) => {
        delete result.id;
        expect(result).to.exist;
        for (const key in result) {
          expect(result[key]).to.equal(demoProfile[key]);
        }
      });
  });

  it('when get profile and this profile exist in db', () => {
    return LT(profileFunc.findOrCreate)
      .event({
        principalId: 'vkontakte|95851704',
        body: demoProfile,
      })
      .expectResult((result) => {
        delete result.id;
        expect(result).to.exist;
        for (const key in result) {
          expect(result[key]).to.equal(demoProfile[key]);
        }
      });
  });

  it('when get profile and principalId field is bad', () => {
    return LT(profileFunc.findOrCreate)
      .event({
        principalId: 'vkontakte',
        body: demoProfile,
      })
      .expectError();
  });

  it('when get profile and db is off', () => {
    delete process.env.IS_OFFLINE;
    return LT(profileFunc.findOrCreate)
      .event({
        principalId: 'vkontakte',
        body: demoProfile,
      })
      .expectError();
  });
});

describe(`getting all items from db`, () => {
  before(beforeTests);
  after(afterTests);

  it('getting all items', () => {
    return LT(profileFunc.getAll)
      .expectResult((res) => {
        expect(res).to.exist;
      });
  });

  it('getting all items but db is off', () => {
    delete process.env.IS_OFFLINE;
    return LT(profileFunc.getAll)
      .expectError();
  });
});

describe(`update profile`, () => {
  const profile = HFT.getFakeProfile();
  before(beforeTests);
  after(afterTests);

  it('create profile before update', () => {
    return LT(profileFunc.findOrCreate)
      .event({
        principalId: 'vkontakte|95851704',
        body: profile,
      })
      .expectResult((result) => {
        profile['id'] = result.id;
        expect(result).to.exist;
        expect(result.isNew).to.equal(true);
        delete result.isNew;
        for (const key in result) {
          expect(result[key]).to.equal(profile[key]);
        }
      });
  });

  it(`when update profile`, () => {
    profile.firstName = 'Egor';
    return LT(profileFunc.update)
      .event({
        principalId: 'vkontakte|95851704',
        body: {
          field: 'firstName',
          value: 'Egor',
        },
        path: {
          id: profile.id,
        },
      })
      .expectResult(() => {
        return LT(profileFunc.findOrCreate)
          .event({ principalId: 'vkontakte|95851704' })
          .expectResult((result) => {
            expect(result).to.exist;
            for (const key in result) {
              expect(result[key]).to.equal(profile[key]);
            }
          });
      });
  });

  it(`when update profile and path.id is bad`, () => {
    return LT(profileFunc.update)
      .event({
        principalId: 'vkontakte|95851704',
        body: {
          field: 'firstName',
          value: 'Egor',
        },
        path: {
          id: 'blablabla',
        },
      })
      .expectError();
  });

  it(`when update profile and value field is empty`, () => {
    return LT(profileFunc.update)
      .event({
        principalId: 'vkontakte|95851704',
        body: {
          field: 'firstName',
          value: '',
        },
        path: {
          id: profile.id,
        },
      })
      .expectError();
  });

  it('when update profile and db is off', () => {
    delete process.env.IS_OFFLINE;
    return LT(profileFunc.update)
      .event({
        principalId: 'vkontakte',
        body: {
          field: 'firstName',
          value: 'Egor',
        },
        path: {
          id: profile.id,
        },
      })
      .expectError();
  });

});
