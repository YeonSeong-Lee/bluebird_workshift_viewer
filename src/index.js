const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const ExcelJS = require('exceljs');
const path = require('node:path');
const chokidar = require('chokidar'); // Add chokidar
const { autoUpdater } = require('electron-updater');


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const gotTheLock = app.requestSingleInstanceLock();

let mainWindow;

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 두 번째 인스턴스가 실행되려고 할 때 기존 창을 포커스합니다.
    if (mainWindow) {
      if (mainWindow.isMinimized() || !mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });
}

  const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true // Enable context isolation
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'blue-bird.png')
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  ipcMain.handle('fetch_xlsx', async (event, filePath, monthCount) => {
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.readFile(filePath);
    } catch (error) {
      console.error('Error reading Excel file:', error);
      throw error;
    }

    const result = [];
    const options = { includeEmpty: true };

    const totalTabs = workbook.worksheets.length;
    const startTab = Math.max(totalTabs - monthCount, 0);

    for (let i = startTab; i < totalTabs; i++) {
      const cur_tab = workbook.worksheets[i];
      const sheet_data = [];
      cur_tab.eachRow(options, (row, rowNum) => {
        sheet_data[rowNum] = [];
        row.eachCell(options, (cell, cellNum) => {
          sheet_data[rowNum][cellNum] = { value: cell.value, style: cell.style };
        });
      });
      result.push({ name: cur_tab.name, data: sheet_data });
    }

    return result;
  });

  // Watch for changes to the Excel file
  let watcher;
  ipcMain.handle('set_file_path', (event, filePath) => {
    if (watcher) {
      watcher.close();
    }
    watcher = chokidar.watch(filePath, {
      persistent: true
    });

    watcher.on('change', () => {
      mainWindow.webContents.send('file-changed');
    });
  });

  ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Excel Files', extensions: ['xlsx', 'xls'] }
        ]
    });
    return result.filePaths;
  });

  // 자동 업데이트 체크 및 이벤트 핸들러
  autoUpdater.checkForUpdatesAndNotify();

  // 업데이트 진행상황 이벤트
  autoUpdater.on('checking-for-update', () => {
    console.log('업데이트 확인 중...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('업데이트가 있습니다.');
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('현재 최신 버전입니다.');
  });

  autoUpdater.on('error', (err) => {
    console.log('업데이트 중 오류가 발생했습니다: ' + err);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    let message = `다운로드 속도: ${progressObj.bytesPerSecond}`;
    message += ` - 진행률: ${progressObj.percent}%`;
    message += ` (${progressObj.transferred}/${progressObj.total})`;
    console.log(message);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('업데이트가 다운로드되었습니다.');
    // 사용자에게 업데이트 설치 확인
    dialog.showMessageBox({
      type: 'info',
      title: `파랑새둥지 근무표 업데이트 준비 완료, ${app.getVersion()}`,
      message: '업데이트가 다운로드되었습니다. 최신 버전으로 업데이트 하시겠습니까?',
      buttons: ['예', '아니오']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  // 수동 업데이트 체크를 위한 IPC 핸들러
  ipcMain.handle('check-updates', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
