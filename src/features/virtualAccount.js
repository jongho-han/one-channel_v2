import { APP } from '../core/config.js';
import { randomDigits } from '../core/format.js';
import { icon } from '../ui/icons.js';

/* 보험료 납입 (PM-01): 가상계좌 발급 --------------------------------------- */
export const PAY_BY_ACCOUNT = '내 계좌에서 출금';
export const PAY_BY_VIRTUAL = '가상계좌로 이체';
export const VIRTUAL_ACCOUNT_BANKS = {          // 발급 가능 은행 → 가상계좌번호 형식(샘플)
  'iM뱅크': () => `508-90-${randomDigits(6)}-${randomDigits(1)}`,
  '농협':   () => `790-${randomDigits(4)}-${randomDigits(4)}-${randomDigits(2)}`,
};
const VIRTUAL_ACCOUNT_HOLDER = () => 'iM라이프';
const VIRTUAL_ACCOUNT_DEADLINE = '오후 6시';

export const isVirtualPayment = values => values.how === PAY_BY_VIRTUAL;

/** 인증 후 발급된 가상계좌 정보 + 이용안내 */
export function virtualAccountInfo(flow) {
  const bank = flow.values.vbank || Object.keys(VIRTUAL_ACCOUNT_BANKS)[0];
  flow.virtualAccount ??= { bank, number: VIRTUAL_ACCOUNT_BANKS[bank](), holder: VIRTUAL_ACCOUNT_HOLDER() };
  const { number, holder } = flow.virtualAccount;
  return `
  <div class="card va-card">
    <h2>가상계좌 정보</h2>
    <dl class="kv">
      <dt>은행명</dt><dd><b>${flow.virtualAccount.bank}</b></dd>
      <dt>가상계좌번호</dt><dd class="va-row"><b class="num va-no">${number}</b>
        <button class="btn sm copy-btn" data-action="copy-text" data-text="${number}" data-label="가상계좌번호" aria-label="가상계좌번호 ${number} 복사">${icon('copy')}복사</button></dd>
      <dt>예금주명</dt><dd>${holder}</dd>
    </dl>
  </div>
  <div class="box warn mt-14 va-guide">${icon('alert')}<div>
    <b>이용안내</b>
    <ul>
      <li>유효한 시간 내에 입금하셔야 보험료 납입이 완료됩니다.</li>
      <li>입금 유효기간: 신청일(${APP.today}) ${VIRTUAL_ACCOUNT_DEADLINE}까지</li>
      <li>유효기간 내 미입금 시 가상계좌는 자동 폐기됩니다.</li>
    </ul>
  </div></div>`;
}
