@echo off
echo 구글 드라이브 업로드 스크립트 시작...

:: 스크립트가 있는 디렉토리로 이동
cd /d %~dp0

:: google-drive-uploader.exe 실행
google-drive-uploader.exe

:: 에러 발생 시 처리
if errorlevel 1 (
    echo 스크립트 실행 중 오류가 발생했습니다.
    pause
    exit /b 1
)

echo 스크립트 실행이 완료되었습니다.
timeout /t 5 