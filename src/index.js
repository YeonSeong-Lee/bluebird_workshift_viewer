const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const ExcelJS = require('exceljs');
const path = require('node:path');
const chokidar = require('chokidar'); // Add chokidar

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}


const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // Set to false for security
      contextIsolation: true // Enable context isolation
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'blue-bird.png')
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  ipcMain.handle('fetch_xlsx', async (event, filePath) => {
    const sheet_data = [];
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.readFile(filePath);
    } catch (error) {
      console.error('Error reading Excel file:', error);
      return null;
    }
    const worksheet = workbook.worksheets[workbook.worksheets.length - 1];
    sheet_data.push(worksheet.name);
    const options = { includeEmpty: true };
    
    worksheet.eachRow(options, (row, rowNum) => {
      sheet_data[rowNum] = []
      row.eachCell(options, (cell, cellNum) => {
        sheet_data[rowNum][cellNum] = { value:cell.value, style:cell.style }
      })
    })
    return sheet_data;
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
      console.log('file-changed');
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
