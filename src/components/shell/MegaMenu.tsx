import { MENU_GROUPS, MENU_TREE } from '../../data/menu';
import type { MegaMenu as MegaMenuState } from '../../state/store';
import { Icon } from '../Icon';

/** 메가메뉴: 왼쪽 2Depth 목록, 오른쪽에 선택한 2Depth의 3Depth */
export function MegaMenu({ mega }: { mega: MegaMenuState | null }) {
  if (!mega) return <div className="mega" id="mega" role="region" aria-label="세부 메뉴" hidden />;

  const sections = Object.entries(MENU_TREE[mega.group]);
  const [activeTitle, activeScreens] = sections[mega.index];
  return (
    <div className="mega" id="mega" role="region" aria-label="세부 메뉴" data-group={mega.group}>
      <div className="wrap">
        <div className="mega-depth2" role="group" aria-label={`${MENU_GROUPS[mega.group].label} 2Depth 메뉴`}>
          {sections.map(([title], index) => (
            <button key={title} className={index === mega.index ? 'on' : ''} aria-expanded={index === mega.index} aria-controls="megaPanel"
                    data-action="mega-section" data-group={mega.group} data-index={index}>
              <span>{title}</span><Icon name="chev" />
            </button>
          ))}
        </div>
        <div className="mega-depth3" id="megaPanel" role="group" aria-labelledby="megaTitle">
          <p className="mega-title" id="megaTitle">{activeTitle}</p>
          <ul>
            {activeScreens.map(screen => (
              <li key={screen.id}>
                <button data-action="open" data-id={screen.id}>
                  {screen.depth3}
                  {screen.authLevel === 'A2' && <><Icon name="lock" /><span className="sr-only">(추가인증 필요)</span></>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
