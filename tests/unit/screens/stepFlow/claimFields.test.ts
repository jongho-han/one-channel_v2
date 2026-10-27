/* 보험금 청구(PY-01) 입력 항목: 사고 유형 · 사고일 다음 사고장소(초진병원, 필수) · 사고 발생경위 */
import { STEP_FLOWS } from '../../../../src/screens/stepFlows';

const fields = STEP_FLOWS['PY-01'].fields;
const field = (id: string) => fields.find(item => item.id === id);

test('사고 유형: 질병 · 재해 · 기타', () => {
  expect(field('acc')?.options).toEqual(['질병', '재해', '기타']);
});

test('사고일 바로 다음에 사고장소(초진병원) 필수, 그다음 사고 발생경위', () => {
  const ids = fields.map(item => item.id);
  expect(ids.slice(ids.indexOf('date1'), ids.indexOf('date1') + 3)).toEqual(['date1', 'place', 'story']);
  expect(field('place')).toMatchObject({ label: '사고장소(초진병원)' });
  expect(field('place')?.optional).toBeFalsy();
  expect(field('date1')).toMatchObject({ label: '사고일(초진일)', type: 'date' });
  expect(field('story')).toMatchObject({ label: '사고(발생경위/치료내용)', type: 'textarea', placeholder: '예) 오늘 계단을 급하게 내려가다 발목을 접지름' });
  expect(field('story')?.optional).toBeFalsy();   // 필수
  expect(field('story')?.help).toMatch(/육하원칙/);
  expect(field('hosp')).toBeUndefined();   // 병원명은 사고장소(초진병원)로 대체
});

test('사고 유형 「기타」는 오른쪽에 직접 입력', () => {
  expect(field('acc')?.other).toEqual({ option: '기타', placeholder: '사고 유형을 입력해 주세요' });
});

test('청구 내용: 사망 · 장해 · 진단 · 입원 · 수술 · 통원 · 치아 · 실손의료비', () => {
  expect(field('kind')?.options).toEqual(['사망', '장해', '진단', '입원', '수술', '통원', '치아', '실손의료비']);
});
