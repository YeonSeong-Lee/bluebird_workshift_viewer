# Google Drive 자동 업로드 도구 실행 가이드

## 설치 전 준비사항
1. Google Cloud Console에서 서비스 계정 생성
   - [Google Cloud Console](https://console.cloud.google.com) 방문
   - 새 프로젝트 생성
   - Google Drive API 활성화
   - 서비스 계정 생성 및 키(JSON) 다운로드

## 설치 및 실행 방법
1. `autoUpload.exe`와 `run_upload.bat` 파일을 같은 폴더에 저장합니다.
2. 다운로드한 서비스 계정 키 파일을 `service-account.json`으로 이름을 변경하고 같은 폴더에 저장합니다.
3. `config.json` 파일을 열고 필요한 설정을 수정합니다:
4. `run_upload.bat` 파일을 실행하여 자동 업로드 도구를 실행합니다.

## 주의사항
- 서비스 계정 키 파일(`service-account.json`)는 외부에 노출되지 않도록 주의해야 합니다.
- 파일 접근 권한이 없는 경우 업로드가 실패할 수 있습니다.

