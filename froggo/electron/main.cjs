const { app, BrowserWindow, Menu, Tray, ipcMain } = require("electron");
const path = require("path");

const fs = require("fs");
const savePath = path.join(app.getPath("userData"), "froggo-save.json");

function loadSave() {
  try {
    return JSON.parse(fs.readFileSync(savePath, "utf8"));
  } catch {
    return null;
  }
}
function writeSave(data) {
  try {
    fs.writeFileSync(savePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Could not save:", err.message);
  }
}

const isDev = !app.isPackaged;
let win = null;
let tray = null;

function createWindow() {
  win = new BrowserWindow({
    width: 224,
    height: 256,
    icon: path.join(__dirname, "assets/froggo.ico"),
    transparent: true,
    frame: false,
    alwaysOnTop: false,
    resizable: false,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

function createTray() {
  tray = new Tray(path.join(__dirname, "assets/froggo.ico"));
  tray.setToolTip("Froggo");

  const menu = Menu.buildFromTemplate([
    {
      label: "Show / Hide frog",
      click: () => {
        win.isVisible() ? win.hide() : win.show();
      },
    },
    {
      label: "Settings",
      click: () => win.webContents.send("frog-action", "settings"),
    },
    { type: "separator" },
    { label: "Quit Froggo", role: "quit" },
  ]);
  tray.setContextMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.on("open-context-menu", (event) => {
  const menu = Menu.buildFromTemplate([
    {
      label: "Give water",
      click: () => event.sender.send("frog-action", "water"),
    },
    { label: "Feed", click: () => event.sender.send("frog-action", "food") },
    {
      label: "Stretch",
      click: () => event.sender.send("frog-action", "stretch"),
    },
    { type: "separator" },
    {
      label: "Make it hop",
      click: () => event.sender.send("frog-action", "hop"),
    },
    {
      label: "Settings",
      click: () => event.sender.send("frog-action", "settings"),
    },
  ]);
  menu.popup();
});

ipcMain.on("resize-window", (event, { width, height }) => {
  if (!win) return;
  const [x, y] = win.getPosition();
  const [oldWidth, oldHeight] = win.getSize();
  win.setResizable(true);
  win.setBounds({
    x: x + (oldWidth - width) / 2,
    y: y + (oldHeight - height),
    width,
    height,
  });
  win.setResizable(false);
});

ipcMain.on("drag-window", (event, { dx, dy }) => {
  if (!win) return;
  const [x, y] = win.getPosition();
  win.setPosition(x + dx, y + dy);
});

ipcMain.handle("load-save", () => loadSave());
ipcMain.on("write-save", (event, data) => writeSave(data));
