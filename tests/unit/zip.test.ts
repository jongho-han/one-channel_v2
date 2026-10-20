/* 압축 없이 묶는 zip: 바로가기(.url)를 브라우저가 이름을 바꾸지 않게 담아 받기 */
import { crc32, zipFiles } from '../../src/core/zip';

const u32 = (bytes: Uint8Array, at: number) => new DataView(bytes.buffer).getUint32(at, true);
const u16 = (bytes: Uint8Array, at: number) => new DataView(bytes.buffer).getUint16(at, true);

describe('zip', () => {
  test('crc32: 표준 값', () => {
    expect(crc32(new TextEncoder().encode('hello'))).toBe(0x3610a686);
    expect(crc32(new Uint8Array())).toBe(0);
  });

  test('zipFiles: 파일 하나를 한글 이름(UTF-8) 그대로 담는다', () => {
    const zip = zipFiles([{ name: '사이버창구.url', body: 'URL=https://a.test/' }]);
    const name = new TextEncoder().encode('사이버창구.url');
    expect(u32(zip, 0)).toBe(0x04034b50);           // 파일 머리
    expect(u16(zip, 6) & 0x0800).toBe(0x0800);      // 이름 UTF-8 표시
    expect(u16(zip, 8)).toBe(0);                    // 압축 안 함
    expect(u32(zip, 14)).toBe(crc32(new TextEncoder().encode('URL=https://a.test/')));
    expect(u16(zip, 26)).toBe(name.length);
    expect(new TextDecoder().decode(zip.slice(30, 30 + name.length))).toBe('사이버창구.url');
    expect(new TextDecoder().decode(zip.slice(30 + name.length, 30 + name.length + 19))).toBe('URL=https://a.test/');
  });

  test('zipFiles: 끝에 목록(중앙 디렉터리) 위치와 개수', () => {
    const zip = zipFiles([{ name: 'a.txt', body: 'A' }, { name: 'b.txt', body: 'BB' }]);
    const end = zip.length - 22;
    expect(u32(zip, end)).toBe(0x06054b50);
    expect(u16(zip, end + 10)).toBe(2);
    const dirAt = u32(zip, end + 16);
    expect(u32(zip, dirAt)).toBe(0x02014b50);
    expect(dirAt + u32(zip, end + 12)).toBe(end);
  });
});
