/* 메뉴정의서 데이터의 타입 정의 (원본: menuRepository.js · menu-spec.json) */
import * as repository from './menuRepository.js';

export type AuthLevel = 'A0' | 'A1' | 'A2';

export interface ScreenSpec {
  id: string;
  depth1: string;
  depth2: string;
  depth3: string;
  screenType: string;
  authLevel: AuthLevel;
}

export interface MenuGroup {
  label: string;
  icon: string;
}

export const MENU_ORDER: readonly string[] = repository.MENU_ORDER;
export const MENU_GROUPS = repository.MENU_GROUPS as Record<string, MenuGroup>;
export const MENU_TREE = repository.MENU_TREE as Record<string, Record<string, ScreenSpec[]>>;
export const SCREEN_BY_ID = repository.SCREEN_BY_ID as Record<string, ScreenSpec>;
