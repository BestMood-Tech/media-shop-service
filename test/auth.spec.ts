import * as profileFunc from '../api/auth/handler';
import { expect } from 'chai';
import * as LT from 'lambda-tester';
import { HelperForTests } from './helper';

const HFT = new HelperForTests();
describe('checking add and get profile in db', () => {

    const demoProfile = {
        firstName: 'Semyon',
        lastName: 'Ermolenko',
        social: 'vkontakte',
        nickName: 'sem.ermolenko',
        socialId: '95851704',
        currency: '$',
        picture: 'https://avatars2.githubusercontent.com/u/26054782?v=4'
    };

    before((done) => {
        process.env.USERS_TABLE = 'bmt-media-shop-service-users';
        process.env.IS_OFFLINE = 'true';
        HFT.removeItemFromTable(process.env.USERS_TABLE, done);
    });

    after(() => {
        delete process.env.USERS_TABLE;
        delete process.env.IS_OFFLINE;
    });

    it('when create profile with empty field', () => {
        const tmp = {
            firstName: 'Semyon',
            lastName: 'Ermolenko',
            social: 'vkontakte',
            nickName: 'sem.ermolenko',
            socialId: '95851704',
            currency: '',
            picture: 'https://avatars2.githubusercontent.com/u/26054782?v=4'
        };
        return LT(profileFunc.getProfile)
            .event({
                principalId: 'vkontakte|95851704',
                body: tmp
            })
            .expectError();
    });

    it('when create profile', () => {
        return LT(profileFunc.getProfile)
            .event({
                principalId: 'vkontakte|95851704',
                body: demoProfile
            })
            .expectResult((result) => {
                delete result.body.id;
                expect(result.body).to.exist;
                for (const key of Object.keys(result.body)) {
                    expect(result.body[key]).to.equal(demoProfile[key]);
                }
            });
    });

    it('when create profile but this profile is exist in db', () => {
        return LT(profileFunc.getProfile)
            .event({
                principalId: 'vkontakte|95851704',
                body: demoProfile
            })
            .expectResult((result) => {
                expect(result.body).to.equal(undefined);
            });
    });

    it('when get profile and this profile exist in db', () => {
        return LT(profileFunc.getProfile)
            .event({
                principalId: 'vkontakte|95851704',
                body: demoProfile
            })
            .expectResult((result) => {
                delete result.id;
                expect(result).to.exist;
                for (const key of Object.keys(result)) {
                    expect(result[key]).to.equal(demoProfile[key]);
                }
            });
    });

    it('when get profile and principalId field is bad', () => {
        return LT(profileFunc.getProfile)
            .event({
                principalId: 'vkontakte',
                body: demoProfile
            })
            .expectError();
    });

    it('when get profile and db is off', () => {
        delete process.env.IS_OFFLINE;
        return LT(profileFunc.getProfile)
            .event({
                principalId: 'vkontakte',
                body: demoProfile
            })
            .expectError();
    });
});

describe(`getting all items from db`, () => {
    before(() => {
        process.env.USERS_TABLE = 'bmt-media-shop-service-users';
        process.env.IS_OFFLINE = 'true';
    });

    after(() => {
        delete process.env.USERS_TABLE;
        delete process.env.IS_OFFLINE;
    });

    it('getting all items', () => {
        return LT(profileFunc.getAllProfiles)
            .expectResult((res) => {
                expect(res).to.exist;
            });
    });

    it('getting all items but db is off', () => {
        delete process.env.IS_OFFLINE;
        return LT(profileFunc.getAllProfiles)
            .expectError();
    });
});

describe(`update profile`, () => {
    const profile: any = {
        firstName: 'Semyon',
        lastName: 'Ermolenko',
        social: 'vkontakte',
        nickName: 'sem.ermolenko',
        socialId: '95851704',
        currency: '$',
        picture: 'https://avatars2.githubusercontent.com/u/26054782?v=4'
    };
    before((done) => {
        process.env.USERS_TABLE = 'bmt-media-shop-service-users';
        process.env.IS_OFFLINE = 'true';
        HFT.removeItemFromTable(process.env.USERS_TABLE, done);
    });

    after(() => {
        delete process.env.USERS_TABLE;
        delete process.env.IS_OFFLINE;
    });

    it('create profile before update', () => {
        return LT(profileFunc.getProfile)
            .event({
                principalId: 'vkontakte|95851704',
                body: profile
            })
            .expectResult((result) => {
                profile['id'] = result.body.id;
                expect(result.body).to.exist;
                for (const key of Object.keys(result.body)) {
                    expect(result.body[key]).to.equal(profile[key]);
                }
            });
    });

    it(`when update profile`, () => {
        profile.firstName = 'Egor';
        return LT(profileFunc.updateProfile)
            .event({
                principalId: 'vkontakte|95851704',
                body: {
                    field: 'firstName',
                    value: 'Egor'
                },
                path: {
                    id: profile.id
                }
            })
            .expectResult(() => {
                return LT(profileFunc.getProfile)
                    .event({principalId: 'vkontakte|95851704'})
                    .expectResult((result) => {
                        expect(result).to.exist;
                        for (const key of Object.keys(result)) {
                            expect(result[key]).to.equal(profile[key]);
                        }
                    });
            });
    });

    it(`when update profile and path.id is bad`, () => {
        return LT(profileFunc.updateProfile)
            .event({
                principalId: 'vkontakte|95851704',
                body: {
                    field: 'firstName',
                    value: 'Egor'
                },
                path: {
                    id: 'blablabla'
                }
            })
            .expectError();
    });

    it(`when update profile and value field is empty`, () => {
        return LT(profileFunc.updateProfile)
            .event({
                principalId: 'vkontakte|95851704',
                body: {
                    field: 'firstName',
                    value: ''
                },
                path: {
                    id: profile.id
                }
            })
            .expectError();
    });

    it('when update profile and db is off', () => {
        delete process.env.IS_OFFLINE;
        return LT(profileFunc.updateProfile)
            .event({
                principalId: 'vkontakte',
                body: {
                    field: 'firstName',
                    value: 'Egor'
                },
                path: {
                    id: profile.id
                }
            })
            .expectError();
    });
});