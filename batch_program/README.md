<div align="center">
  <img src="batch_program_logo.png" alt="Batch Program Logo" width="200">
  <h1>Google Drive 자동 업로드 도구</h1>
</div>

## 📋 설치 전 준비사항
1. Google Cloud Console에서 서비스 계정 생성
   - [Google Cloud Console](https://console.cloud.google.com) 방문
   - 새 프로젝트 생성
   - Google Drive API 활성화
   - 서비스 계정 생성 및 키(JSON) 다운로드

## 🚀 설치 및 실행 방법
1. 다운로드한 서비스 계정 키 파일을 `service-account.json`으로 이름을 변경하고 루트폴더에 저장합니다.
2. `config.json` 파일을 열고 필요한 설정을 수정합니다.
3. `npm run build` 명령어로 생성된 `google-drive-uploader.exe` 파일을 원하는 폴더에 저장합니다.
4. Windows 작업 스케줄러를 실행합니다:
   - 시작 메뉴에서 "작업 스케줄러" 검색
   - "기본 작업 만들기" 클릭
   - 작업 이름과 설명 입력
   - 트리거 설정 (예: 매일 특정 시간)
   - 동작에서 `google-drive-uploader.exe` 파일 경로 지정
   - 조건 및 설정 구성 후 완료
5. 작업 스케줄러에서 즉시 실행하여 정상 작동 여부를 테스트합니다.

## ⚠️ 주의사항
- 서비스 계정 키 파일(`service-account.json`)는 외부에 노출되지 않도록 주의해야 합니다.
- 파일 접근 권한이 없는 경우 업로드가 실패할 수 있습니다.

<div align="center">
  <p>© 2024 YeonSeong Lee</p>
</div>

