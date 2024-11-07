const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');
const path = require('path');
const fs = require('fs').promises;
const chokidar = require('chokidar');
const fsSync = require('fs');

let mainWindow;
let drive;
let watcherInstance = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('./src/index.html');
}

function setupIpcHandlers() {
  // 파일 선택 다이얼로그로 변경
  ipcMain.handle('select-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (!result.canceled) {
      const selectedPath = result.filePaths[0];
      const success = watchFile(selectedPath);
      return { 
        path: selectedPath, 
        success: success 
      };
    }
    return null;
  });

  // 수동 업로드 처리 수정
  ipcMain.handle('manual-upload', async (event, filePath) => {
    try {
      await uploadFile(filePath);
      return { success: true, message: '파일이 업로드되었습니다.' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });
}

// 파일 감시 함수 수정
function watchFile(filePath) {
  if (watcherInstance) {
    watcherInstance.close();
  }

  try {
    // 파일이 존재하는지 확인
    if (!fsSync.existsSync(filePath)) {
      throw new Error('파일이 존재하지 않습니다.');
    }

    watcherInstance = chokidar.watch(filePath, {
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    watcherInstance
      .on('change', async path => {
        console.log(`File ${path} has been changed`);
        await uploadFile(path);
      })
      .on('error', error => {
        console.error(`Watch error: ${error}`);
        mainWindow.webContents.send('watch-error', error.message);
      });

    return true;
  } catch (error) {
    console.error('Error setting up file watch:', error);
    mainWindow.webContents.send('watch-error', error.message);
    return false;
  }
}

// Google Drive 초기화 함수 추가
async function initializeGoogleDrive() {
  try {
    const auth = await authenticate({
      keyfilePath: path.join(__dirname, '../credentials.json'),
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.metadata'
      ],
    });

    drive = google.drive({ version: 'v3', auth });
    console.log('Google Drive API initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Google Drive:', error);
    mainWindow.webContents.send('google-drive-error', error.message);
    return false;
  }
}

app.whenReady().then(async () => {
  await createWindow();
  setupIpcHandlers();
  
  // Google Drive 초기화
  const driveInitialized = await initializeGoogleDrive();
  if (!driveInitialized) {
    console.error('Failed to initialize Google Drive');
    // 에러 메시지를 UI에 표시
    mainWindow.webContents.send('initialization-error', 'Google Drive 초기화에 실패했습니다.');
  }
  
  // 저장된 경로가 있다면 해당 경로로 감시 시작
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      const savedPath = localStorage.getItem('watchPath');
      if (savedPath) {
        document.getElementById('watchPath').value = savedPath;
        updateWatchDirectory(savedPath);
      }
    `);
  });
});

// 파일 업로드 함수 수정
async function uploadFile(filePath) {
  try {
    const fileName = path.basename(filePath);
    const fileMetadata = {
      name: fileName,
    };

    const media = {
      mimeType: 'application/octet-stream',
      body: fsSync.createReadStream(filePath)  // fs.promises 대신 일반 fs 사용
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id'
    });

    console.log(`File ${fileName} uploaded successfully. File ID: ${response.data.id}`);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

// ... rest of the main.js code ... 