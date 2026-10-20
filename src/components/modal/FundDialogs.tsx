/* 펀드변경: 적합성진단 필요 안내 · 오늘 재진단 불가 안내 */
import { InfoBox } from '../widgets';
import { ModalTitle } from './ModalTitle';

export function SuitabilityRequiredDialog({ reasons }: { reasons: readonly string[] }) {
  return (
    <>
      <ModalTitle>적합성진단이 필요합니다</ModalTitle>
      <p>아래 사유로 펀드를 변경하기 전에 투자자 적합성진단을 먼저 진행합니다.</p>
      <ul className="reason-list">{reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
      <div className="navrow inline mt-16">
        <button className="btn lg" data-action="close-modal">취소</button>
        <button className="btn pri lg" data-action="suit-start">적합성진단 시작</button>
      </div>
    </>
  );
}

export function FundBlockedDialog({ profile, grade, nextDay }: { profile: string; grade: string; nextDay: string }) {
  return (
    <>
      <ModalTitle>오늘은 적합성진단을 다시 할 수 없습니다</ModalTitle>
      <p>오늘 진행한 적합성진단 결과({profile})로는 변경 후 편입비율({grade})에 투자할 수 없습니다.</p>
      <InfoBox tone="warn" icon="alert">{nextDay}(익일) 이후 적합성진단을 다시 진행해 주세요. 투자성향 범위 안으로 비율을 조정하면 바로 변경할 수 있습니다.</InfoBox>
      <button className="btn pri block mt-16" data-action="close-modal">확인</button>
    </>
  );
}
