/* eslint-env jest */
import { displayOrderId, getUnpaidLabel, isPaid } from './order';

test('only a successful payment is paid', () => {
  expect(isPaid({ payment_status: 'PAYMENT_SUCCESS' })).toBe(true);
  expect(isPaid({ payment_status: 'PAYMENT_INITIATED' })).toBe(false);
  expect(isPaid({ payment_status: 'PAYMENT_ERROR' })).toBe(false);
  expect(isPaid({})).toBe(false);
});

test('an abandoned payment is not completed, a refused one failed', () => {
  expect(getUnpaidLabel({ payment_status: 'PAYMENT_INITIATED' })).toBe('PAYMENT NOT COMPLETED');
  expect(getUnpaidLabel({ payment_status: 'PAYMENT_DECLINED' })).toBe('PAYMENT FAILED');
  expect(getUnpaidLabel({ payment_status: 'TIMED_OUT' })).toBe('PAYMENT FAILED');
});

test('short order number when there is one, otherwise the long id', () => {
  expect(displayOrderId({ id: 'rCDmprlE3MF3dd07cgoS', order_number: 'AA1001' })).toBe('AA1001');
  expect(displayOrderId({ id: 'rCDmprlE3MF3dd07cgoS' })).toBe('rCDmprlE3MF3dd07cgoS');
});
