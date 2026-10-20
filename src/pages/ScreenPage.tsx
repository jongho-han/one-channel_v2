/* 업무 화면 틀: 좌측 메뉴(LNB) · 현재 위치 · 제목·부제·배지 · 본문(#sbody, 화면유형별 React 템플릿) */
import type { ReactNode } from 'react';
import { Icon } from '../components/Icon';
import { SCREEN_SUBTITLES } from '../data/homeContent';
import { MENU_GROUPS, MENU_TREE, SCREEN_BY_ID, type ScreenSpec } from '../data/menu';
import { REACT_TEMPLATES } from '../screens/reactTemplates';

function SideMenu({ screen }: { screen: ScreenSpec }) {
  return (
    <nav className="lnb" aria-labelledby="lnbTitle">
      <h2 id="lnbTitle">{MENU_GROUPS[screen.depth1].label}</h2>
      {Object.entries(MENU_TREE[screen.depth1]).map(([title, screens], groupIndex) => (
        <div className="lnb-group" role="group" aria-labelledby={`lnbG${groupIndex}`} key={title}>
          <div className="g" id={`lnbG${groupIndex}`}>{title}</div>
          <div className="lnb-sub">
            {screens.map(item => (
              <button key={item.id} className={item.id === screen.id ? 'on' : undefined} data-action="open" data-id={item.id}
                      aria-current={item.id === screen.id ? 'page' : undefined}>{item.depth3}</button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

const subtitleOf = (screen: ScreenSpec) => SCREEN_SUBTITLES.byScreen[screen.id] || SCREEN_SUBTITLES.byBizType[screen.bizType ?? ''] || '';

function AuthBadge({ screen }: { screen: ScreenSpec }) {
  if (screen.authLevel === 'A2') return <span className="bdg lock"><Icon name="lock" />추가인증 필요</span>;   // 아이콘 + 글자 (색에만 의존하지 않음)
  if (screen.authLevel === 'A0') return <span className="bdg open">로그인 없이 이용</span>;
  return null;
}

export function ScreenFrame({ screen, children }: { screen: ScreenSpec; children: ReactNode }) {
  return (
    <div className="page"><div className="wrap sub-layout">
      <SideMenu screen={screen} />
      <div className="sub-main">
        <nav className="crumb" aria-label="현재 위치">홈 <Icon name="chev" /> {MENU_GROUPS[screen.depth1].label} <Icon name="chev" /> {screen.depth2} <Icon name="chev" /> <b aria-current="page">{screen.depth3}</b></nav>
        <div className="title-row">
          <div><h1>{screen.depth3}</h1><p>{subtitleOf(screen)}</p></div>
          <div className="badges"><AuthBadge screen={screen} /><span className="bdg">이용대상 · {screen.target}</span></div>
        </div>
        <div id="sbody">{children}</div>
      </div>
    </div></div>
  );
}

export function ScreenPage({ screenId }: { screenId: string }) {
  const screen = SCREEN_BY_ID[screenId];
  return <ScreenFrame screen={screen}>{REACT_TEMPLATES[screen.screenType]?.(screen) ?? null}</ScreenFrame>;
}
