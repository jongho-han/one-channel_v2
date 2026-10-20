import { MENU_GROUPS, MENU_ORDER } from '../../data/menu';
import type { MegaMenu as MegaMenuState } from '../../state/store';
import { Icon } from '../Icon';
import { AuthButton, LargeTextButton, Logo } from './common';
import { MegaMenu } from './MegaMenu';

interface HeaderProps {
  currentGroup: string;          // 지금 화면의 1Depth ('' = 업무 화면 아님)
  isAllMenuOpen: boolean;
  largeText: boolean;
  isLoggedIn: boolean;
  userName: string;
  mega: MegaMenuState | null;
}

/** PC 헤더: 로고 · 주메뉴(메가메뉴) · 큰글씨 · 로그인 · 전체메뉴 */
export function Header({ currentGroup, isAllMenuOpen, largeText, isLoggedIn, userName, mega }: HeaderProps) {
  return (
    <>
      <div className="wrap">
        <Logo />
        <nav className="gnb" id="gnb" aria-label="주메뉴">
          {MENU_ORDER.map(key => (
            <button key={key} className={currentGroup === key ? 'on' : ''} data-action="open-group" data-group={key}
                    aria-controls="mega" aria-expanded={mega?.group === key} aria-current={currentGroup === key ? 'true' : undefined}>
              {MENU_GROUPS[key].label}
            </button>
          ))}
        </nav>
        <div className="actions">
          <LargeTextButton on={largeText} />
          {isLoggedIn && <span className="user-chip"><Icon name="user" /><b>{userName}</b>님</span>}
          <AuthButton isLoggedIn={isLoggedIn} />
          <button className="icon-btn" data-action="toggle-all-menu" aria-label={isAllMenuOpen ? '전체메뉴 닫기' : '전체메뉴'} aria-expanded={isAllMenuOpen}>
            <Icon name={isAllMenuOpen ? 'x' : 'menu'} />
          </button>
        </div>
      </div>
      <MegaMenu mega={mega} />
    </>
  );
}
