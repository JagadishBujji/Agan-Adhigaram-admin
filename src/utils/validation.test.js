/* eslint-env jest */
import { isValidName } from './validation';

describe('isValidName (book title, author, publisher...)', () => {
  it.each(['Vada Poche!', 'Dr. Ramya', 'Ramya & Sethu Ram', 'Ainthinai: Five Landscapes', 'Board book (Tamil)', "Kid's Book", 'Book 2'])(
    'accepts %s',
    (name) => expect(isValidName(name)).toBe(true)
  );

  it.each(['', '   ', undefined, '<script>'])('rejects %p', (name) => expect(isValidName(name)).toBeFalsy());
});
