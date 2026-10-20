/* 메인 업무 검색: 입력하면 추천 업무(콤보박스), 화살표로 고르고 Enter로 이동 */
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { flushSync } from 'react-dom';
import { Icon, type IconName } from '../components/Icon';
import { MENU_GROUPS, type ScreenSpec } from '../data/menu';

interface HomeSearchProps {
  search: (query: string) => ScreenSpec[];
  onOpen: (screenId: string) => void;
  announce: (message: string) => void;
}

interface SearchState {
  query: string;
  results: ScreenSpec[];
  shown: boolean;            // 추천 영역 표시
  highlighted: number;       // 화살표로 고른 순번 (-1: 없음)
  drawn: boolean;            // 한 번이라도 그렸는지
}

const groupIcon = (screen: ScreenSpec) => MENU_GROUPS[screen.depth1].icon as IconName;

export function HomeSearch({ search, onOpen, announce }: HomeSearchProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<SearchState>({ query: '', results: [], shown: false, highlighted: -1, drawn: false });
  const update = (patch: Partial<SearchState>) => flushSync(() => setState(current => ({ ...current, ...patch })));

  const draw = (query: string): ScreenSpec[] => {
    const results = search(query);
    const hasQuery = Boolean(query.trim());
    update({ query, results, shown: Boolean(results.length) || hasQuery, highlighted: -1, drawn: true });
    if (hasQuery) announce(results.length ? `추천 업무 ${results.length}건` : '맞는 업무가 없습니다.');
    return results;
  };

  /* 검색 영역 바깥을 누르면 추천 닫기 */
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) flushSync(() => setState(current => ({ ...current, shown: false })));
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const last = state.results.length - 1;
    switch (event.key) {
      case 'ArrowDown': update({ highlighted: Math.min(state.highlighted + 1, last) }); break;
      case 'ArrowUp':   update({ highlighted: Math.max(state.highlighted - 1, 0) }); break;
      case 'Enter':     if (state.results.length) onOpen(state.results[Math.max(state.highlighted, 0)].id); return;
      case 'Escape':    update({ shown: false, results: state.results }); return;
      default: return;
    }
    event.preventDefault();
  };

  const expanded = state.shown && state.results.length > 0;
  return (
    <div className="search" role="search" ref={rootRef}>
      <span className="search-icon"><Icon name="search" /></span>
      <label className="sr-only" htmlFor="q">하고 싶은 업무 검색</label>
      <input id="q" type="search" placeholder="예: 병원비 청구, 대출 이자, 납입증명서" autoComplete="off"
             role="combobox" aria-autocomplete="list" aria-controls="sugList" aria-expanded={expanded} aria-describedby="qHint"
             aria-activedescendant={state.highlighted >= 0 ? `sug-${state.highlighted}` : undefined}
             onInput={event => draw(event.currentTarget.value)} onKeyDown={keyDown} />
      <span className="sr-only" id="qHint">입력하면 추천 업무가 아래에 나타나며, 위아래 화살표로 고르고 Enter로 이동합니다.</span>
      <button className="btn pri" id="qbtn" onClick={() => { const results = draw(state.query); if (results.length) onOpen(results[0].id); }}>찾기</button>
      <div className="suggest" id="sug" hidden={!state.shown}>
        {state.drawn && (state.results.length
          ? <div role="listbox" id="sugList" aria-label="추천 업무">
              {state.results.map((screen, index) => (
                <button key={screen.id} role="option" id={`sug-${index}`} className={index === state.highlighted ? 'on' : undefined}
                        aria-selected={index === state.highlighted} tabIndex={-1} data-action="open" data-id={screen.id}>
                  <Icon name={groupIcon(screen)} /><span>{screen.depth3}</span>
                  <small>{MENU_GROUPS[screen.depth1].label} › {screen.depth2}</small>
                </button>
              ))}
            </div>
          : <div className="empty compact">“{state.query}”와 맞는 업무가 없습니다. 전체메뉴에서 찾아보세요.</div>)}
      </div>
    </div>
  );
}
