/* 국가 목록 (샘플): 자주 선택하는 국가 + 그 외 국가(가나다순) — 국적·거주지국 선택 레이어팝업 */
export interface Country {
  name: string;
  code?: string;   // 자주 선택하는 국가에 표시하는 국가 코드
}

export const FREQUENT_COUNTRIES: readonly Country[] = [
  { name: '대한민국', code: 'KR' }, { name: '미국', code: 'US' }, { name: '중국', code: 'CN' }, { name: '일본', code: 'JP' },
];

const OTHER_NAMES = [
  '가나', '그리스', '나이지리아', '남아프리카공화국', '네덜란드', '네팔', '노르웨이', '뉴질랜드', '대만', '덴마크', '독일', '라오스', '러시아', '루마니아',
  '말레이시아', '멕시코', '몽골', '미얀마', '방글라데시', '베트남', '벨기에', '브라질', '사우디아라비아', '스리랑카', '스웨덴', '스위스', '스페인', '싱가포르',
  '아랍에미리트', '아르헨티나', '아일랜드', '영국', '오스트리아', '우즈베키스탄', '이스라엘', '이집트', '이탈리아', '인도', '인도네시아', '카자흐스탄', '캄보디아',
  '캐나다', '케냐', '콜롬비아', '키르기스스탄', '태국', '튀르키예', '파키스탄', '페루', '포르투갈', '폴란드', '프랑스', '핀란드', '필리핀', '헝가리', '호주', '홍콩',
];

/** 전체 국가 (가나다순) */
export const COUNTRIES: readonly Country[] = [...FREQUENT_COUNTRIES, ...OTHER_NAMES.map(name => ({ name }))]
  .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

/** 국가 검색: 이름에 검색어가 들어간 국가 (공백 무시) */
export function searchCountries(query: string): Country[] {
  const keyword = query.replace(/\s+/g, '');
  return COUNTRIES.filter(country => country.name.includes(keyword));
}
