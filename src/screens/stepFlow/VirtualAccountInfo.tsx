/* 보험료 납입(PM-01): 인증 후 발급된 가상계좌 정보 + 이용안내 */
import { Icon } from '../../components/Icon';
import type { VirtualAccount } from '../../features/virtualAccount';
import { VIRTUAL_ACCOUNT_DEADLINE } from '../../features/virtualAccount';

export function VirtualAccountInfo({ account, today }: { account: VirtualAccount; today: string }) {
  return (
    <>
      <div className="card va-card">
        <h2>가상계좌 정보</h2>
        <dl className="kv">
          <dt>은행명</dt><dd><b>{account.bank}</b></dd>
          <dt>가상계좌번호</dt><dd className="va-row"><b className="num va-no">{account.number}</b>
            <button className="btn sm copy-btn" data-action="copy-text" data-text={account.number} data-label="가상계좌번호" aria-label={`가상계좌번호 ${account.number} 복사`}><Icon name="copy" />복사</button></dd>
          <dt>예금주명</dt><dd>{account.holder}</dd>
        </dl>
      </div>
      <div className="box warn mt-14 va-guide"><Icon name="alert" /><div>
        <b>이용안내</b>
        <ul>
          <li>유효한 시간 내에 입금하셔야 보험료 납입이 완료됩니다.</li>
          <li>입금 유효기간: 신청일({today}) {VIRTUAL_ACCOUNT_DEADLINE}까지</li>
          <li>유효기간 내 미입금 시 가상계좌는 자동 폐기됩니다.</li>
        </ul>
      </div></div>
    </>
  );
}
