// 토큰 명세를 테마 CSS로 생성한다.  npm run tokens:generate
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { renderThemeCss } from '../src/shared/tokens/render.ts';
import { TOKENS } from '../src/shared/tokens/spec/index.ts';

const out = path.resolve(import.meta.dirname, '../src/shared/tokens/__generated__/theme.css');
writeFileSync(out, renderThemeCss(TOKENS));
console.log(`generated ${path.relative(process.cwd(), out)}`);
