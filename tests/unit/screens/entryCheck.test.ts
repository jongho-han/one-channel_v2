/* 화면 들어갈 때 확인 팝업: 개인정보변경(MY-01) 개인정보 유출 주의 */
import { CHANGE_FORMS } from '../../../src/screens/changeForms';

test('개인정보변경(MY-01) 진입 확인: 개인정보 유출 주의', () => {
  expect(CHANGE_FORMS['MY-01'].entryCheck).toEqual({ title: '개인정보 유출 주의', message: '다른사람의 요청으로\n개인정보를 변경하나요?' });
});

test('다른 단일폼에는 진입 확인 없음', () => {
  expect(CHANGE_FORMS['PM-02'].entryCheck).toBeUndefined();
});
