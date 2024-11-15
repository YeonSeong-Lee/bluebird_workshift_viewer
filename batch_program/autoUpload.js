const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// 설정 파일 경로
const CONFIG_PATH = path.join(__dirname, 'config.json');
const SERVICE_ACCOUNT_PATH = path.join(__dirname, './service-account.json');

async function uploadToGoogleDrive() {
    try {
        // 설정 파일 읽기
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        const watchPath = config.watchPath;

        // 파일 존재 여부 확인 추가
        if (!fs.existsSync(watchPath)) {
            console.error(`[${new Date().toLocaleString()}] 파일이 존재하지 않습니다: ${watchPath}`);
            return;
        }

        // 파일 접근 권한 확인
        try {
            await fs.promises.access(watchPath, fs.constants.R_OK);
        } catch (error) {
            console.error(`[${new Date().toLocaleString()}] 파일 접근 권한이 없습니다: ${watchPath}`);
            return;
        }

        // Google Drive API 인증
        const auth = new google.auth.GoogleAuth({
            keyFile: SERVICE_ACCOUNT_PATH,
            scopes: ['https://www.googleapis.com/auth/drive.file']
        });

        const drive = google.drive({ version: 'v3', auth });

        // 파일 업로드
        const fileName = path.basename(watchPath);
        const fileMetadata = {
            name: fileName,
            parents: ['1-Fe3tn0Wz2YcyrnZCqxhJJyRjp798znT']
        };

        // 파일 업로드 전 스트림 에러 핸들링 추가
        const fileStream = fs.createReadStream(watchPath);
        fileStream.on('error', (error) => {
            console.error(`[${new Date().toLocaleString()}] 파일 스트림 에러:`, error.message);
        });

        const media = {
            mimeType: 'application/octet-stream',
            body: fileStream
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink'
        });

        console.log(`[${new Date().toLocaleString()}] 파일 업로드 성공`);
        console.log(`파일명: ${fileName}`);
        console.log(`파일 ID: ${response.data.id}`);
        console.log(`웹 링크: ${response.data.webViewLink}`);

    } catch (error) {
        console.error(`[${new Date().toLocaleString()}] 오류 발생:`, error.message);
    }
}

// 스크립트 실행
uploadToGoogleDrive(); 