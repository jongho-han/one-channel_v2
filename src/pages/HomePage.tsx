/* 메인: 검색·로그인/내 보험 요약 · 할 일(로그인) · 자주 찾는 업무 · 이럴 땐 이렇게 · 공지·고객센터 */
import { Icon } from '../components/Icon';
import { APP } from '../core/config';
import { CONTRACTS, USER } from '../data/customerRepository';
import { HOME } from '../data/homeContent';
import type { ScreenSpec } from '../data/menu';
import { HOME_NOTICE_COUNT, NOTICES, type Notice } from '../data/noticeRepository';
import { LOGIN_METHODS } from '../services/auth';
import { HomeSearch } from './HomeSearch';

interface HomePageProps {
  isLoggedIn: boolean;
  search: (query: string) => ScreenSpec[];
  onOpen: (screenId: string) => void;
  announce: (message: string) => void;
}

const loginMethods = LOGIN_METHODS;

function MySummaryCard() {
  const monthlyPremium = CONTRACTS.filter(contract => contract.status === '정상').reduce((sum, contract) => sum + contract.premium, 0);
  const totalLoan = CONTRACTS.reduce((sum, contract) => sum + contract.loan, 0);
  return (
    <div className="login-card my-summary">
      <div className="hi">{USER.name}님의 보험<small>{APP.today} 기준</small></div>
      <dl className="kv3">
        <div><dt>보유계약</dt><dd className="num">{CONTRACTS.length}건</dd></div>
        <div><dt>이번 달 보험료</dt><dd className="num">{(monthlyPremium / 10000).toFixed(1)}만원</dd></div>
        <div><dt>대출 잔액</dt><dd className="num">{totalLoan ? `${Math.round(totalLoan / 10000).toLocaleString()}만원` : '없음'}</dd></div>
      </dl>
      <button className="btn pri block" data-action="open" data-id="CT-01">계약종합현황 보기</button>
    </div>
  );
}

function GuestLoginCard() {
  return (
    <div className="login-card login-guest">
      <h2>로그인하고 바로 처리하세요</h2>
      <p>조회·청구·대출·증명서 발급을 한 번의 인증으로 이용할 수 있습니다.</p>
      <div className="auth-grid">
        {loginMethods.map(method => <button key={method.name} className="auth-opt" data-action="login" data-method={method.name}><b>{method.name}</b><small>{method.desc}</small></button>)}
      </div>
      <div className="foot"><span>로그인 없이 이용</span><button data-action="open" data-id="CS-01">청구서류 내려받기</button></div>
    </div>
  );
}

function Hero({ isLoggedIn, search, onOpen, announce }: HomePageProps) {
  return (
    <section className="hero"><div className="wrap">
      <div className="shortbar">
        <span>자주 이용하신다면 바로가기를 만들어 두세요.</span>
        <button className="shortbtn" data-action="open-shortcut"><span className="ap" aria-hidden="true">iM</span><span className="sl">바로가기 추가</span></button>
      </div>
      <div>
        <div className="eyebrow">iM라이프 사이버창구</div>
        <h1>{isLoggedIn ? <>{USER.name}님, <em>무엇을 도와드릴까요?</em></> : <>보험 업무, <em>찾지 말고 물어보세요</em></>}</h1>
        <p className="lead">“병원비 청구”, “주소 변경”, “연말정산”처럼 하고 싶은 일을 입력하면 바로 그 화면으로 안내합니다.</p>
        <HomeSearch search={search} onOpen={onOpen} announce={announce} />
        <div className="chips"><span>많이 찾는 업무</span>
          {HOME.popular.map(([label, id]) => <button key={id} className="chip" data-action="open" data-id={id}>{label}</button>)}
        </div>
      </div>
      {isLoggedIn ? <MySummaryCard /> : <GuestLoginCard />}
    </div></section>
  );
}

function TodoSection() {
  return (
    <section className="sec"><div className="wrap">
      <div className="sec-h"><div><h2>지금 확인이 필요해요</h2><p>{USER.name}님 계약에서 처리할 일을 모았습니다.</p></div></div>
      <div className="todo">
        {HOME.todos.map(todo => (
          <button key={todo.id} className="todo-card" data-action="open" data-id={todo.id}>
            <span className={`dot ${todo.tone}`}><Icon name={todo.icon} /></span>
            <span><b>{todo.title}</b><span>{todo.desc}</span></span>
          </button>
        ))}
      </div>
    </div></section>
  );
}

function QuickSection() {
  return (
    <section className="sec"><div className="wrap">
      <div className="sec-h"><div><h2>자주 찾는 업무</h2></div><button className="link" data-action="nav" data-page="all">전체메뉴 <Icon name="chev" /></button></div>
      <div className="quick">
        {HOME.quickTasks.map(([id, label, icon]) => <button key={id} className="q" data-action="open" data-id={id}><span className="ic"><Icon name={icon} /></span>{label}</button>)}
      </div>
    </div></section>
  );
}

function LifeGuideSection() {
  return (
    <section className="sec life-guide"><div className="wrap">
      <div className="sec-h"><div><h2>이럴 땐 이렇게</h2><p>상황을 고르면 필요한 업무를 순서대로 안내합니다.</p></div></div>
      <div className="life">
        {HOME.lifeGuides.map(([title, desc, links]) => (
          <div className="life-card" key={title}><h3>{title}</h3><p>{desc}</p>
            <div className="go">{links.map(([label, id]) => <button key={id} data-action="open" data-id={id}>{label}<Icon name="chev" /></button>)}</div>
          </div>
        ))}
      </div>
    </div></section>
  );
}

export const NoticeTag = ({ type }: { type: Notice['type'] }) => <span className={`tag ${type === '공지' ? 'n' : 'i'}`}>{type}</span>;

function NoticeSection() {
  return (
    <section className="sec last"><div className="wrap two">
      <div className="panel">
        <h2>공지사항 <button className="link" data-action="open-notices" aria-label="공지사항 더보기">더보기 <Icon name="chev" /></button></h2>
        <ul className="notice-list">
          {NOTICES.slice(0, HOME_NOTICE_COUNT).map(notice => (
            <li key={notice.id}><button className="notice-link" data-action="open-notices" data-notice={notice.id} aria-haspopup="dialog">
              <span><NoticeTag type={notice.type} />{notice.title}</span><time>{notice.date}</time></button></li>
          ))}
        </ul>
      </div>
      <div className="panel cc">
        <h2>고객센터</h2>
        <div className="tel num">1588-4770</div>
        <p>평일 09:00~18:00 · 사고보험금 접수 24시간(모바일)</p>
        <div className="row">
          <button className="btn sm" data-action="open" data-id="CS-01">청구서류 받기</button>
        </div>
      </div>
    </div></section>
  );
}

export function HomePage(props: HomePageProps) {
  return (
    <>
      <Hero {...props} />
      {props.isLoggedIn && <TodoSection />}
      <QuickSection />
      <LifeGuideSection />
      <NoticeSection />
    </>
  );
}
