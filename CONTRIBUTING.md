# 팀 작업 안내

이 저장소는 소규모 팀이 가볍게 관리합니다. 팀원은 별도 Pull Request 없이 `main`에 직접 커밋하고 push할 수 있습니다.

## 작업 순서

```bash
git status --short
git switch main
git pull --ff-only origin main
```

처음 실행할 때만 의존성을 설치합니다.

```bash
npm ci
```

수정 후 아래 검증을 모두 통과시킵니다.

```bash
npm run test:run
npm run build
git diff --check
```

변경한 파일만 지정해 커밋하고 바로 `main`에 push합니다.

```bash
git status --short
git add src/data/ideas.json  # 예시: 실제 수정한 파일만 적습니다
git commit -m "feat: 아이디어 기록 추가"
git push origin main
```

커밋 종류는 기능 `feat`, 버그 수정 `fix`, 문서 `docs`, 설정·관리 `chore`를 사용합니다.

## push가 거절되면

다른 팀원이 먼저 올린 변경을 받은 뒤 다시 push합니다.

```bash
git pull --rebase origin main
npm run test:run
npm run build
git push origin main
```

충돌이 생기면 `git rebase --abort`로 되돌리고 팀에 공유합니다. `main`에는 `--force` 또는 `--force-with-lease`를 사용하지 않습니다.

## 공개 저장소 주의사항

- 사용자가 제공한 아이디어 원문, 첨부파일과 실명은 공개할 수 있습니다.
- 확보한 원문은 `public/documents`에 보존하고 `Artifact.url`로 연결합니다.
- 원본을 확보하지 못한 자료는 URL을 만들지 않고 `원본 미수집`으로 표시합니다.
- 비밀번호, 인증 토큰, 브라우저 쿠키와 세션 정보는 올리지 않습니다.

## 배포

`main`은 소스 브랜치이고 공개 사이트는 `gh-pages` 브랜치에서 배포됩니다. `main`에 push한 뒤 사이트 배포가 필요하면 저장소 관리자에게 알려주세요.
