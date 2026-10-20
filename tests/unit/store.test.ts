/* 상태 store: 구독·알림 (React 셸이 상태 변경을 받아 다시 그림) */
import { freshScreenState, getVersion, notify, state, subscribe } from '../../src/state/store';

describe('store', () => {
  test('초기 상태', () => {
    expect(state.route).toEqual({ page: 'home', screenId: null });
    expect(state.ui.mega).toBeNull();
    expect(freshScreenState()).toEqual({ flow: null, list: {} });
  });

  test('notify 하면 구독자가 불리고 버전이 바뀜, 해지 후에는 불리지 않음', () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);
    const before = getVersion();
    notify();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getVersion()).not.toBe(before);
    unsubscribe();
    notify();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
