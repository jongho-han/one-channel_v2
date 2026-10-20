/* 화면 공통 부품 (ui/widgets.js 의 React 판) */
import { render } from '@testing-library/react';
import { InfoBox, StatusChip } from '../../src/components/widgets';

describe('StatusChip', () => {
  test.each([['정상', 'g'], ['납입유예', 'a'], ['미납', 'r'], ['심사중', 'b'], ['취소', 'n'], ['알수없음', 'n']])('%s → 색 %s', (status, tone) => {
    const { container } = render(<StatusChip status={status} />);
    const chip = container.querySelector('span');
    expect(chip?.className).toBe(`st ${tone}`);
    expect(chip?.textContent).toBe(status);
  });
});

describe('InfoBox', () => {
  test('톤·아이콘·내용', () => {
    const { container } = render(<InfoBox tone="warn compact" icon="alert">납입유예 중입니다.</InfoBox>);
    const box = container.firstElementChild;
    expect(box?.className).toBe('box warn compact');
    expect(box?.querySelector('svg.i')).toBeTruthy();
    expect(box?.lastElementChild?.tagName).toBe('DIV');
    expect(box?.textContent).toBe('납입유예 중입니다.');
  });
});
