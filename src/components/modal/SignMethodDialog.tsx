/* 전자서명 수단 선택 (금전 거래는 휴대폰 추가인증 안내) */
import { ModalTitle } from './ModalTitle';

export interface AuthMethod { name: string; desc: string; icon?: string }   // icon: 로그인 화면용

export function SignMethodDialog({ needsExtraAuth, methods, onChoose }: { needsExtraAuth: boolean; methods: readonly AuthMethod[]; onChoose: (name: string) => void }) {
  return (
    <>
      <ModalTitle>{needsExtraAuth ? '전자서명 + 휴대폰 추가인증' : '전자서명'}</ModalTitle>
      <p>{needsExtraAuth ? '본인 계좌로 돈이 오가는 업무라 인증서 서명 후 휴대폰 인증을 한 번 더 진행합니다.' : '변경 내용에 인증서로 서명하면 바로 반영됩니다.'}</p>
      <div className="auth-grid">
        {methods.map(method => <button key={method.name} className="auth-opt" data-auth={method.name} onClick={() => onChoose(method.name)}><b>{method.name}</b><small>{method.desc}</small></button>)}
      </div>
      <button className="btn block mt-16" data-action="close-modal">취소</button>
    </>
  );
}

/** 인증 요청 대기 (시뮬레이션: 잠시 후 자동 인증) */
export function AuthWaiting({ title, methodName }: { title: string; methodName: string }) {
  return (
    <>
      <ModalTitle>{title}</ModalTitle>
      <p>{methodName}(으)로 인증을 요청했습니다. 휴대폰 앱에서 인증을 완료해 주세요.</p>
      <div className="spin" role="img" aria-label="인증 대기 중" />
      <p className="hint">프로토타입: 잠시 후 자동으로 인증됩니다.</p>
    </>
  );
}
