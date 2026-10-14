/* 한글 텍스트만 담은 1쪽짜리 PDF 생성 (시연용 샘플 서류)
 * 글꼴은 내장하지 않고 PDF 뷰어 기본 한글 글꼴(Adobe-Korea1 · HYGoThic-Medium)을 사용 */
const PAGE = { width: 595, height: 842, margin: 56 };   // A4(pt)

/** 문자열 → UTF-16BE 16진수 (UniKS-UCS2-H 인코딩용) */
const toHex = text => [...text].map(ch => ch.charCodeAt(0).toString(16).padStart(4, '0')).join('').toUpperCase();

/** lines = [{ text, size }] 위에서부터 차례로 배치 */
function pageContent(lines) {
  let y = PAGE.height - PAGE.margin;
  return lines.map(({ text = '', size = 11, gap = 0.6 }) => {
    y -= size + gap * size;
    return text ? `BT /F1 ${size} Tf ${PAGE.margin} ${Math.round(y)} Td <${toHex(text)}> Tj ET` : '';
  }).filter(Boolean).join('\n');
}

/** PDF 문서 문자열(ASCII)을 만듦 — xref 오프셋은 바이트 길이 = 문자 길이 */
export function buildPdf({ title, lines }) {
  const content = pageContent(lines);
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE.width} ${PAGE.height}] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type0 /BaseFont /HYGoThic-Medium /Encoding /UniKS-UCS2-H /DescendantFonts [6 0 R] >>',
    '<< /Type /Font /Subtype /CIDFontType0 /BaseFont /HYGoThic-Medium /CIDSystemInfo << /Registry (Adobe) /Ordering (Korea1) /Supplement 1 >> /FontDescriptor 7 0 R /DW 1000 /W [1 95 500] >>',
    '<< /Type /FontDescriptor /FontName /HYGoThic-Medium /Flags 6 /FontBBox [-6 -145 1003 880] /ItalicAngle 0 /Ascent 880 /Descent -120 /CapHeight 880 /StemV 93 >>',
    `<< /Title <FEFF${toHex(title)}> /Producer (One Channel Prototype) >>`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = objects.map((body, index) => {
    const offset = pdf.length;
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
    return offset;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${objects.length} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return pdf;
}
