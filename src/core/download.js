/** 브라우저에서 만든 내용을 파일로 내려받기 (Blob → 임시 링크 클릭) */
export function saveFile(fileName, body, type = 'application/octet-stream') {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([body], { type }));
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => { URL.revokeObjectURL(link.href); link.remove(); }, 500);
}
