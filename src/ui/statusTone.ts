/** 처리 상태 → 색 톤 (g 정상·완료, a 주의, r 조치 필요, b 진행 중, n 기타) */
export const STATUS_TONE: Readonly<Record<string, 'g' | 'a' | 'r' | 'b' | 'n'>> = {
  '정상': 'g', '완료': 'g', '지급완료': 'g', '실행완료': 'g',
  '납입유예': 'a',
  '보완서류 요청': 'r', '연체': 'r', '미납': 'r',
  '접수': 'b', '심사중': 'b', '처리중': 'b',
  '취소': 'n',
};

export const statusTone = (status: string) => STATUS_TONE[status] ?? 'n';
