import { useSyncExternalStore } from 'react';
import { getVersion, state, subscribe, type AppState } from '../../state/store';

/** 전역 state 를 읽고, notify() 때마다 다시 그림 */
export function useAppState(): AppState {
  useSyncExternalStore(subscribe, getVersion);
  return state;
}
