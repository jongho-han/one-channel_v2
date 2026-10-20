/* 바로가기 파일이 열 주소: 지금 보고 있는 사이버창구 */
import { shortcutFile, shortcutTarget } from '../../src/features/shortcut';

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

describe('shortcutFile', () => {
  test('Windows: .url 을 zip 에 담아 받는다 (크롬·엣지가 .url 을 .download 로 바꾸므로)', () => {
    const file = shortcutFile('win', '사이버창구', 'https://a.test/');
    expect(file.name).toBe('사이버창구.zip');
    expect(file.type).toBe('application/zip');
    expect(new TextDecoder().decode(file.body as Uint8Array)).toContain('사이버창구.url[InternetShortcut]\r\nURL=https://a.test/\r\n');
  });

  test('Mac: .webloc 그대로, 사파리가 확장자를 덧붙이지 않게 octet-stream, 주소는 XML 이스케이프', () => {
    const file = shortcutFile('mac', '사이버창구', 'https://a.test/?a=1&b=2');
    expect(file.name).toBe('사이버창구.webloc');
    expect(file.type).toBe('application/octet-stream');
    expect(file.body).toContain('<string>https://a.test/?a=1&amp;b=2</string>');
  });
});
