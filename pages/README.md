# pages (비워 둔 폴더)

이 폴더는 일부러 비워 둔다.

Next.js는 프로젝트 루트에 `pages` 폴더가 없으면 `src/pages`를 Pages Router로 읽는다.
이 프로젝트의 `src/pages`는 Feature-Sliced Design의 pages 레이어라서 라우터가 읽으면 안 된다.
루트에 빈 `pages` 폴더를 두어 Next.js가 `src/pages`를 건드리지 않게 한다.

라우팅은 루트의 `app` 폴더(App Router)가 맡는다.
