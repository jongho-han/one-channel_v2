import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

/* 결과물: dist/index.html 한 파일 (CSS·JS 인라인) — 더블클릭으로 열어도 동작 */
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: { target: 'es2022', outDir: 'dist', emptyOutDir: true },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.test.{ts,tsx}'],
  },
});
