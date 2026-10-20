/* 바로가기 파일이 열 주소: 지금 보고 있는 사이버창구 */
import { shortcutTarget } from '../../src/features/shortcut';

const FALLBACK = 'https://www.imlifeins.co.kr/cyber/main.do';

describe('shortcutTarget', () => {
  test('웹에서 열었으면 지금 페이지 주소(# 이하 제외)', () => {
    expect(shortcutTarget('https://jongho-han.github.io/one-channel_v2/#CT-02', FALLBACK)).toBe('https://jongho-han.github.io/one-channel_v2/');
  });

  test('파일을 더블클릭해 열었으면 그 파일 주소', () => {
    expect(shortcutTarget('file:///C:/Users/me/Downloads/index.html', FALLBACK)).toBe('file:///C:/Users/me/Downloads/index.html');
  });

  test('주소를 알 수 없으면 설정 주소', () => {
    expect(shortcutTarget('about:blank', FALLBACK)).toBe(FALLBACK);
    expect(shortcutTarget('', FALLBACK)).toBe(FALLBACK);
  });
});
