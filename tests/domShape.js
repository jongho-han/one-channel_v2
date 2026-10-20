/* DOM 구조 비교용 정규화: 태그·클래스·속성·글자만 남김 (템플릿 JS → React 전환 시 동일성 확인)
   - 클래스는 정렬, style 은 공백·끝 세미콜론 제거, 이어진 글자 노드는 합친 뒤 공백 정리
   - 입력 요소의 value·checked·selected 는 속성 대신 실제 상태(property)로 비교 (React는 속성 대신 상태로 반영) */
const FORM_STATE_ATTRS = new Set(['value', 'checked', 'selected']);
const normalizeStyle = style => style.replace(/\s+/g, '').replace(/;$/, '');

export function domShape(node) {
  const children = [];
  let text = '';
  const flushText = () => {
    const collapsed = text.replace(/\s+/g, ' ').trim();
    if (collapsed) children.push(collapsed);
    text = '';
  };
  for (const child of node.childNodes) {
    if (child.nodeType === 3) { text += child.textContent; continue; }
    if (child.nodeType !== 1) continue;
    flushText();
    children.push(domShape(child));
  }
  flushText();

  const attrs = {};
  for (const { name, value } of [...node.attributes].sort((a, b) => a.name.localeCompare(b.name))) {
    if (name === 'class') attrs.class = value.split(/\s+/).filter(Boolean).sort().join(' ');
    else if (name === 'style') attrs.style = normalizeStyle(value);
    else if (!FORM_STATE_ATTRS.has(name)) attrs[name] = value;
  }
  if (attrs.class === '') delete attrs.class;
  const shape = { tag: node.tagName.toLowerCase(), attrs, children };
  if (node.tagName === 'INPUT') shape.state = node.type === 'radio' || node.type === 'checkbox' ? { checked: node.checked, value: node.value } : { value: node.value };
  if (node.tagName === 'OPTION') shape.state = { selected: node.selected };
  return shape;
}
