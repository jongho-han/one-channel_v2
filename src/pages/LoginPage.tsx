/* 로그인: 인증수단 선택 (data-action="login") — 로그인이 필요한 화면에서 왔으면 그 화면 이름을 안내 */
import { Icon } from '../components/Icon';
import { LOGIN_METHODS } from '../services/auth';

const loginMethods = LOGIN_METHODS;

export function LoginPage({ pendingTitle }: { pendingTitle?: string }) {
  return (
    <div className="page"><div className="wrap"><div className="login-page">
      <div className="title-row"><div>
        <h1>로그인</h1>
        <p>{pendingTitle ? <><b>{pendingTitle}</b> 화면은 본인 확인 후 이용할 수 있습니다.</> : '사용하시는 인증 방법을 선택하세요.'}</p>
      </div></div>
      <div className="card"><div className="auth-grid">
        {loginMethods.map(method => (
          <button key={method.name} className="auth-opt" data-action="login" data-method={method.name}>
            <span className="ic"><Icon name={method.icon} /></span><span><b>{method.name}</b><br /><small>{method.desc}</small></span>
          </button>
        ))}
      </div></div>
      <div className="box info mt-14"><Icon name="info" /><div><b>처음 이용하시나요?</b>별도 회원가입 없이 인증서만으로 이용할 수 있습니다. 보험금 지급·계좌 변경 같은 금전 거래는 휴대폰 추가인증을 한 번 더 진행합니다.</div></div>
    </div></div></div>
  );
}
