# makemake

## MVP 제품 점검 (현재 상태)
- **핵심 가치 제안**: 고객의 일정/장소/감정/무드/취향/피드백을 지속 수집해 가장 만족스러운 주간 추천을 제공
- **날씨 포지션**: 추천에 포함되는 여러 신호 중 하나(보조 시그널)
- **기능 스코프**:
  - 대화형 의도 파악 + 일정/감정/무드/장소 신호 통합
  - 추천 생성 파이프라인 및 로컬/원격 스냅샷 저장
  - 기본 UI 흐름 정의
- **리스크/보완 필요**:
  - 원격 스토어 API 스펙/인증 방식 미정
  - 실제 렌더링 UI/모바일 앱 미구현

## 앱 종류/스택과 실행 진입점
- **앱 종류**: TypeScript 기반 CLI/서비스 프로토타입
- **스택**: Node.js + TypeScript
- **Entry point**: `src/index.ts` (`npm run build` 후 `node dist/index.js`)

## 로컬 실행
### 설치
```bash
npm install
```

### 환경 변수
`.env` 파일 또는 셸 환경변수로 설정합니다.
- `FASHION_AGENT_API_KEY` (필수)
- `FASHION_AGENT_MODEL` (선택, 기본값: `gpt-4o-mini`)
- `FASHION_AGENT_REGION` (선택, 기본값: `Seoul`)
- `FASHION_AGENT_STORE_DIR` (선택, 기본값: `.data`)
- `FASHION_AGENT_LOCATION_CONSENT` (`true`/`false`)
- `FASHION_AGENT_LATITUDE` (선택, 위치 동의 시 사용)
- `FASHION_AGENT_LONGITUDE` (선택, 위치 동의 시 사용)
- `FASHION_AGENT_REMOTE_SYNC` (`true`/`false`)
- `FASHION_AGENT_REMOTE_BASE_URL` (원격 동기화 사용 시 필요)
- `FASHION_AGENT_REMOTE_AUTH_TOKEN` (원격 동기화 사용 시 필요)

### 환경 변수 예시
```bash
cp .env.example .env
```

### 실행
```bash
npm run build
npm start
```

## 부족한 것 체크리스트
- [ ] 원격 스냅샷 API 스펙 문서화/인증 방식 정의
- [ ] UI 실제 구현(앱/웹)
- [ ] 추천/피드백 관련 테스트 보강
- [ ] 배포 설정(CI/CD, 빌드 파이프라인)
- [ ] (선택) KMA 실연동 구현(단기예보/동네예보)

## 로컬 검증 커맨드 (순서)
```bash
npm install
npm run check
npm test
```
