/* 바탕화면·홈 화면 바로가기 안내 (기기 탭은 data-action="shortcut-tab") */
import type { ReactNode } from 'react';
import { ModalTitle } from './ModalTitle';

export type ShortcutTab = 'pc' | 'ios' | 'and';

interface ShortcutGuideProps {
  tab: ShortcutTab;
  name: string;
  url: string;
  iconPng: string;          // 앱 아이콘 이미지 (그리지 못했으면 '')
  canInstall: boolean;      // 브라우저 설치 창을 띄울 수 있으면 바로 추가 버튼
}

const TABS: readonly [ShortcutTab, string][] = [['pc', 'PC'], ['ios', '아이폰'], ['and', '안드로이드']];

export function ShortcutGuide({ tab, name, url, iconPng, canInstall }: ShortcutGuideProps) {
  const appIcon = <div className="sc-icon">{iconPng && <img src={iconPng} alt="" />}<div><b>{name}</b><small>{url}</small></div></div>;
  const guides: Record<ShortcutTab, ReactNode> = {
    pc: <>
      {appIcon}
      <div className="navrow inline mt-0">
        <button className="btn pri" data-action="download-shortcut" data-kind="win">Windows용 바로가기 받기</button>
        <button className="btn" data-action="download-shortcut" data-kind="mac">Mac용 받기</button>
      </div>
      <ol className="sc-steps"><li><b>Windows</b>: 받은 압축 파일(.zip)을 열어 안에 있는 '{name}' 바로가기를 바탕화면으로 끌어다 놓으세요.</li><li><b>Mac</b>: 받은 '{name}' 파일을 바탕화면으로 끌어다 놓으세요.</li><li>바탕화면 아이콘을 두 번 누르면 사이버창구 메인이 바로 열립니다.</li></ol>
    </>,
    ios: <>
      {appIcon}
      <ol className="sc-steps"><li>Safari에서 사이버창구를 연 상태로 화면 아래 <b>공유 버튼(□↑)</b>을 누르세요.</li><li>목록에서 <b>'홈 화면에 추가'</b>를 고르세요.</li><li>이름이 '{name}'인지 확인하고 <b>'추가'</b>를 누르세요.</li></ol>
    </>,
    and: <>
      {appIcon}
      {canInstall && <button className="btn pri block" data-action="install-app">홈 화면에 바로 추가</button>}
      <ol className="sc-steps"><li>Chrome 오른쪽 위 <b>메뉴(⋮)</b>를 누르세요.</li><li><b>'홈 화면에 추가'</b>를 누르세요.</li><li><b>'추가'</b>를 누르면 홈 화면에 아이콘이 생깁니다.</li></ol>
    </>,
  };
  return (
    <>
      <ModalTitle>{tab === 'pc' ? '바탕화면에 바로가기 추가' : '홈 화면에 바로가기 추가'}</ModalTitle>
      <p>아이콘을 누르면 사이버창구 메인으로 바로 이동합니다.</p>
      <div className="seg block tabs mb-4" role="group" aria-label="기기 선택">
        {TABS.map(([key, label]) => <button key={key} className={key === tab ? 'on' : undefined} aria-pressed={key === tab} data-action="shortcut-tab" data-tab={key}>{label}</button>)}
      </div>
      {guides[tab]}
      <button className="btn block mt-16" data-action="close-modal">닫기</button>
    </>
  );
}
