/* 로고: iM 글자 원 대신 iM 심볼(SVG) */
import { render } from '@testing-library/react';
import { Logo } from '../../../src/components/shell/common';

test('Logo: 심볼은 장식(SVG, 화면낭독기 제외)이고 버튼 이름은 「iM라이프 사이버창구 홈으로」', () => {
  const { container, getByRole } = render(<Logo />);
  const mark = container.querySelector('.logo .mark');
  expect(mark?.tagName.toLowerCase()).toBe('svg');
  expect(mark?.getAttribute('aria-hidden')).toBe('true');
  expect(mark?.getAttribute('focusable')).toBe('false');
  expect(mark?.textContent).toBe('');
  expect(mark?.querySelectorAll('path')).toHaveLength(3);
  expect(getByRole('button').textContent).toBe('iM라이프사이버창구홈으로');
});

test('Logo: 헤더·앱바에 함께 있어도 그라데이션 id 가 겹치지 않음', () => {
  const { container } = render(<><Logo /><Logo /></>);
  const ids = [...container.querySelectorAll('linearGradient')].map(gradient => gradient.id);
  expect(ids).toHaveLength(2);
  expect(new Set(ids).size).toBe(2);
  container.querySelectorAll('.mark').forEach((mark, index) => {
    expect(mark.querySelector('[fill^="url("]')?.getAttribute('fill')).toBe(`url(#${ids[index]})`);
  });
});
