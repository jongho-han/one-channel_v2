/* 전체메뉴: 2Depth를 누르면 3Depth가 아래로 펼쳐짐 (data-action="toggle-menu-section"), 메뉴 이름으로 찾기 */
import { useState } from 'react';
import { flushSync } from 'react-dom';
import { Icon, type IconName } from '../components/Icon';
import { MENU_GROUPS, MENU_ORDER, MENU_TREE, SEARCH_KEYWORDS, type ScreenSpec } from '../data/menu';

interface AllMenuPageProps {
  openSections: ReadonlySet<string>;   // 펼친 2Depth ('1Depth|2Depth')
  announce: (message: string) => void;
}

const searchText = (screen: ScreenSpec) => `${screen.depth3} ${screen.depth2} ${SEARCH_KEYWORDS[screen.id] || ''}`;

export function AllMenuPage({ openSections, announce }: AllMenuPageProps) {
  const [query, setQuery] = useState('');
  const matches = (screen: ScreenSpec) => !query || searchText(screen).includes(query);
  const matchCount = MENU_ORDER.flatMap(group => Object.values(MENU_TREE[group]).flat()).filter(matches).length;

  /** 검색어가 있으면 맞는 메뉴가 있는 2Depth만 펼치고, 지우면 원래 상태로 */
  const searchMenus = (value: string) => {
    const next = value.trim();
    flushSync(() => setQuery(next));
    if (!next) return;
    const count = MENU_ORDER.flatMap(group => Object.values(MENU_TREE[group]).flat()).filter(screen => searchText(screen).includes(next)).length;
    announce(count ? `맞는 메뉴 ${count}개` : '맞는 메뉴가 없습니다.');
  };

  return (
    <div className="page"><div className="wrap">
      <div className="title-row"><div>
        <h1>전체메뉴</h1>
        <p>메뉴를 누르면 세부 메뉴가 펼쳐집니다. <Icon name="lock" /> 표시는 추가인증이 필요한 금전 거래입니다.</p>
      </div></div>
      <div className="search am-search">
        <span className="search-icon"><Icon name="search" /></span>
        <label className="sr-only" htmlFor="amq">메뉴 이름으로 찾기</label>
        <input id="amq" type="search" placeholder="메뉴 이름으로 찾기" onInput={event => searchMenus(event.currentTarget.value)} />
      </div>
      <div className="am" id="amList">
        {MENU_ORDER.map(groupKey => {
          const sections = Object.entries(MENU_TREE[groupKey]);
          const groupMatches = sections.some(([, screens]) => screens.some(matches));
          return (
            <div className="am-col" data-group={groupKey} key={groupKey} hidden={Boolean(query) && !groupMatches || undefined}>
              <h2><Icon name={MENU_GROUPS[groupKey].icon as IconName} />{MENU_GROUPS[groupKey].label}</h2>
              {sections.map(([title, screens], index) => {
                const key = `${groupKey}|${title}`;
                const count = screens.filter(matches).length;
                const isOpen = query ? count > 0 : openSections.has(key);
                const panelId = `amp-${groupKey}${index}`;
                return (
                  <div className={isOpen ? 'acc open' : 'acc'} data-key={key} key={key} hidden={Boolean(query) && !count || undefined}>
                    <button className="acc-h" data-action="toggle-menu-section" aria-expanded={isOpen} aria-controls={panelId}>
                      <span>{title}</span><Icon name="chev" />
                    </button>
                    <ul className="acc-p" id={panelId} hidden={!isOpen || undefined}>
                      {screens.map(screen => (
                        <li key={screen.id} data-n={searchText(screen)} hidden={!matches(screen) || undefined}>
                          <button data-action="open" data-id={screen.id}>
                            <span className="nm">{screen.depth3}</span>
                            <span className="mt">{screen.authLevel === 'A2' && <><Icon name="lock" /><span className="sr-only">(추가인증 필요)</span></>}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <p className="am-empty" id="amNone" hidden={!query || matchCount > 0 || undefined}>맞는 메뉴가 없습니다. 다른 단어로 찾아보세요.</p>
    </div></div>
  );
}
