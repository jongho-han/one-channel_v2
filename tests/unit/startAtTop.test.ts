/* 새로고침하면 메인 맨 위에서 시작: 브라우저의 이전 스크롤 위치 복원을 끄고 맨 위로 */
import { startAtTop } from '../../src/core/dom';

test('스크롤 복원 끄기(manual) + 맨 위로 스크롤', () => {
  const scrollTo = vi.fn();
  const win = { history: { scrollRestoration: 'auto' }, scrollTo } as unknown as Window;
  startAtTop(win);
  expect(win.history.scrollRestoration).toBe('manual');
  expect(scrollTo).toHaveBeenCalledWith({ top: 0 });
});

test('scrollRestoration 을 지원하지 않는 브라우저도 맨 위로', () => {
  const scrollTo = vi.fn();
  startAtTop({ history: {}, scrollTo } as unknown as Window);
  expect(scrollTo).toHaveBeenCalledWith({ top: 0 });
});
