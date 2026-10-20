import { render } from '@testing-library/react';
import { Icon } from '../../../src/components/Icon';

test('Icon: 장식용 선 아이콘(svg.i, 낭독 제외)', () => {
  const { container } = render(<Icon name="home" />);
  const svg = container.querySelector('svg');
  expect(svg?.getAttribute('class')).toBe('i');
  expect(svg?.getAttribute('aria-hidden')).toBe('true');
  expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
  expect(svg?.innerHTML).toContain('<path');
});
