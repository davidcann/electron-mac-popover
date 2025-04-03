const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const { ElectronMacPopover } = require('../')

app.on('ready', () => {
  const win = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      preload: `${__dirname}/preload.js`,
    }
  });

  win.loadFile('index.html');

  const popoverWindow = new BrowserWindow({
    width: 250,
    height: 250,
    frame: false,
    show: true,
    transparent: true,
    titleBarStyle: "hidden",
    type: process.platform == "darwin" ? "panel" : "toolbar",
    fullscreenable: false,
    focusable: false,
    skipTaskbar: true,
    movable: false,
    minimizable: false,
    maximizable: false,
    resizable: false,
  });
  popoverWindow.setWindowButtonVisibility(false);
  popoverWindow.setHasShadow(false);
  popoverWindow.setIgnoreMouseEvents(true);
  popoverWindow.setOpacity(0.0);
  popoverWindow.loadFile('popover.html');

  popoverWindow.webContents.on("context-menu", (event, params) => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Test',
      },
      { type: 'separator' },
      {
        label: 'Inspect Element',
        click: () => popoverWindow.webContents.inspectElement(params.x, params.y)
      },
    ]);
    contextMenu.popup({ window: win });
  });

  const nativePopover = new ElectronMacPopover(popoverWindow.getNativeWindowHandle());

  nativePopover.onClosed(() => {
    console.log("popover closed");
  });

  ipcMain.on('open-popover', (e, rect, size, edge, behavior, animate, appearance) => {
    const options = { rect, size, edge, behavior, animate, appearance };
    console.log('event: open-popover', options);
    nativePopover.show(win.getNativeWindowHandle(), options);
  });

  ipcMain.on('close-popover', (e) => {
    console.log('event: close-popover');
    nativePopover.close();
  });

  ipcMain.on('size-popover', (e, size, animate, duration) => {
    console.log('event: size-popover', size, animate, duration);
    nativePopover.setSize({size, animate, duration});
  });
});
