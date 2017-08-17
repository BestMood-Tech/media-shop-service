import { expect } from 'chai';
import * as helper from '../api/helper';

describe('check helper', () => {
  it('when read file that not exist', () => {
    helper.readFilePromise('')
      .catch((err) => expect(err).to.exist);
  });

  it('when remove file that not exist', () => {
    helper.removeFilePromise('')
      .then((res) => expect(res).to.not.exist);
  });
});