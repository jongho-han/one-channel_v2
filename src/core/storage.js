/** 브라우저 저장소 (사생활 보호 모드 등에서 실패해도 동작은 계속) */
export const storage = {
  get(key)        { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* 저장 실패는 무시 */ } },
};
