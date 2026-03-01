# makemake

Android 텍스트 기반 영어 대화 코치 앱입니다.

## 포함된 기능 (v0 runnable)
- Jetpack Compose 기반 6개 화면(Home/Settings/Topic/Chat/Feedback/History)
- MVVM + Room + DataStore + Keystore(EncryptedSharedPreferences) 구조
- ACTIVE 세션 Resume, 메시지 autosave, End & Feedback 저장
- Clarify/Options UI 동작(Options Bottom Sheet)
- DB 스키마 및 LLM provider 인터페이스 문서 동봉

## 실행 방법
1. Android Studio(최신)로 프로젝트 루트(`/workspace/makemake`)를 엽니다.
2. Gradle Sync 완료 후 `app` 모듈을 실행합니다.
3. 에뮬레이터(Android 8.0+, API 26+) 또는 실제 디바이스에서 실행합니다.

## 로컬 빌드 체크(CLI)
```bash
./gradlew help
```

> 현재 기본 provider는 `MockProvider`로 연결되어 있어 API Key 없이도 대화 플로우를 테스트할 수 있습니다.

## 문서
- `docs/product_spec.md`
- `docs/architecture.md`
- `docs/database_schema.sql`
- `docs/llm_provider_spec.md`
