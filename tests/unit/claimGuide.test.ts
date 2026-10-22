/* 보험금 청구 종류(본인·자녀·수익자): 종류별 피보험자 선택지 */
import { CLAIM_TYPES, claimTypeOf, withClaimType } from '../../src/data/claimGuide';

const FIELDS = [
  { id: 'who', label: '피보험자', type: 'radio' as const, options: ['홍길동(본인)', '홍서연(자녀)', '김영희(배우자)'] },
  { id: 'acc', label: '사고 유형', type: 'radio' as const, options: ['질병'] },
];

test('청구 종류 3가지: 본인보험금 접수 · 자녀보험금 접수 · 수익자 청구', () => {
  expect(CLAIM_TYPES.map(type => type.label)).toEqual(['본인보험금 접수', '자녀보험금 접수', '수익자 청구']);
});

test('claimTypeOf: 모르는 값이면 본인', () => {
  expect(claimTypeOf('child').label).toBe('자녀보험금 접수');
  expect(claimTypeOf(undefined).key).toBe('self');
  expect(claimTypeOf('x').key).toBe('self');
});

test('withClaimType: 피보험자 선택지·안내만 종류에 맞게, 다른 항목은 그대로', () => {
  const self = withClaimType(FIELDS, 'self');
  expect(self[0].options).toEqual(['홍길동(본인)']);
  expect(self[1]).toBe(FIELDS[1]);
  const child = withClaimType(FIELDS, 'child');
  expect(child[0].options).toEqual(['홍서연(자녀)']);
  expect(child[0].help).toMatch(/법정대리인/);
  const beneficiary = withClaimType(FIELDS, 'beneficiary');
  expect(beneficiary[0].options).toEqual(['김영희(배우자)', '홍서연(자녀)']);
  expect(beneficiary[0].help).toMatch(/수익자/);
});

test('자녀보험금 접수 설명: 미성년 자녀만 가능', () => {
  expect(claimTypeOf('child').desc).toBe('※ 자녀보험금 접수는 피보험자 자녀가 미성년자일 때에만 가능합니다.');
});
