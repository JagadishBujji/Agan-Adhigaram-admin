/* eslint-env jest */
import { addImagesWithinLimit, withTimeout } from './upload';

describe('withTimeout', () => {
  it('rejects a promise that never settles', async () => {
    await expect(withTimeout(new Promise(() => {}), 10, 'too slow')).rejects.toThrow('too slow');
  });

  it('passes through a result that arrives in time', async () => {
    await expect(withTimeout(Promise.resolve('ok'), 1000)).resolves.toBe('ok');
  });
});

describe('addImagesWithinLimit', () => {
  it('never keeps more than 6 images', () => {
    const current = [1, 2, 3, 4, 5];
    expect(addImagesWithinLimit(current, [6, 7])).toEqual({ images: [1, 2, 3, 4, 5, 6], dropped: true });
  });

  it('keeps everything when there is room', () => {
    expect(addImagesWithinLimit([1], [2, 3])).toEqual({ images: [1, 2, 3], dropped: false });
  });

  it('does not add to a list that is already over the limit', () => {
    expect(addImagesWithinLimit([1, 2, 3, 4, 5, 6, 7], [8])).toEqual({ images: [1, 2, 3, 4, 5, 6, 7], dropped: true });
  });
});
