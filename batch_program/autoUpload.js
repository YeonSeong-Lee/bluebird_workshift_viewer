const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const winston = require('winston');
require('winston-daily-rotate-file');

// 설정 파일 경로
const CONFIG_PATH = path.join(__dirname, 'config.json');
const SERVICE_ACCOUNT_PATH = path.join(__dirname, './service-account.json');

// 로거 설정 부분 수정
const setupLogger = (config) => {
    if (!config.logging.enabled) return winston.createLogger();

    // logs 디렉토리가 없으면 생성
    if (!fs.existsSync(config.logging.logPath)) {
        fs.mkdirSync(config.logging.logPath, { recursive: true });
    }

    return winston.createLogger({
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message }) => 
                `[${timestamp}] ${level}: ${message}`
            )
        ),
        transports: [
            new winston.transports.DailyRotateFile({
                filename: path.join(config.logging.logPath, 'error-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                level: 'error',
                maxFiles: `${config.logging.keepLogs}d`,
                maxSize: '20m',
                zippedArchive: true
            }),
            new winston.transports.DailyRotateFile({
                filename: path.join(config.logging.logPath, 'combined-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                maxFiles: `${config.logging.keepLogs}d`,
                maxSize: '20m',
                zippedArchive: true
            }),
            new winston.transports.Console()
        ]
    });
};

const validateWatchPath = async (watchPath, logger, errorMessage) => {
    if (!fs.existsSync(watchPath)) {
        logger.error(errorMessage);
        return false;
    }

    try {
        await fs.promises.access(watchPath, fs.constants.R_OK);
        return true;
    } catch (error) {
        logger.error(errorMessage);
        return false;
    }
};

const initializeGoogleDrive = (serviceAccountPath) => {
    const auth = new google.auth.GoogleAuth({
        keyFile: serviceAccountPath,
        scopes: ['https://www.googleapis.com/auth/drive.file']
    });
    return google.drive({ version: 'v3', auth });
};

const prepareUploadData = (watchPath, folderId) => {
    const fileName = path.basename(watchPath);
    const fileMetadata = {
        name: fileName,
        parents: [folderId]
    };

    const fileStream = fs.createReadStream(watchPath);
    const media = {
        mimeType: 'application/octet-stream',
        body: fileStream
    };

    return { fileName, fileMetadata, media, fileStream };
};

const findExistingFile = async (drive, fileName, folderId) => {
    try {
        const response = await drive.files.list({
            q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
            fields: 'files(id, name)',
            spaces: 'drive'
        });
        return response.data.files[0];
    } catch (error) {
        throw new Error(`기존 파일 검색 중 오류 발생: ${error.message}`);
    }
};

const updateExistingFile = async (drive, fileId, media, logger) => {
    try {
        const response = await drive.files.update({
            fileId: fileId,
            media: media,
            fields: 'id, webViewLink'
        });
        return response.data;
    } catch (error) {
        throw new Error(`파일 업데이트 중 오류 발생: ${error.message}`);
    }
};

const uploadFileWithRetry = async (drive, uploadData, config, logger) => {
    const { fileMetadata, media, fileName } = uploadData;
    let attempt = 0;

    while (attempt < config.uploadSettings.retryCount) {
        try {
            // 기존 파일 검색
            const existingFile = await findExistingFile(drive, fileName, config.uploadSettings.folderId);
            let response;

            if (existingFile) {
                // 기존 파일이 있으면 업데이트
                response = await updateExistingFile(drive, existingFile.id, media, logger);
                logger.info(`기존 파일 '${fileName}' 업데이트 완료`);
            } else {
                // 새 파일 생성
                response = await drive.files.create({
                    requestBody: fileMetadata,
                    media: media,
                    fields: 'id, webViewLink'
                });
                logger.info(`새 파일 '${fileName}' 생성 완료`);
            }

            logSuccess(logger, config, fileName, response);
            return true;
        } catch (error) {
            attempt++;
            if (attempt === config.uploadSettings.retryCount) {
                throw error;
            }
            await new Promise(resolve => 
                setTimeout(resolve, config.uploadSettings.retryDelay)
            );
        }
    }
};

const logSuccess = (logger, config, fileName, responseData) => {
    if (config.notification.enabled) {
        logger.info(config.notification.successMessage);
    }
    logger.info(`파일명: ${fileName}`);
    logger.info(`파일 ID: ${responseData.id}`);
    logger.info(`웹 링크: ${responseData.webViewLink}`);
};

const uploadToGoogleDrive = async () => {
    try {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        const logger = setupLogger(config);

        // 경로 유효성 검사
        const isValid = await validateWatchPath(
            config.watchPath, 
            logger, 
            config.notification.errorMessage
        );
        if (!isValid) return;

        // Google Drive 초기화
        const drive = initializeGoogleDrive(SERVICE_ACCOUNT_PATH);

        // 업로드 데이터 준비
        const uploadData = prepareUploadData(
            config.watchPath, 
            config.uploadSettings.folderId
        );

        uploadData.fileStream.on('error', (error) => {
            logger.error(config.notification.errorMessage);
        });

        // 파일 업로드 실행
        await uploadFileWithRetry(drive, uploadData, config, logger);

    } catch (error) {
        if (config?.notification?.enabled) {
            logger.error(config.notification.errorMessage);
        }
        logger.error(`상세 오류: ${error.message}`);
    }
};

// 스크립트 실행
uploadToGoogleDrive(); 