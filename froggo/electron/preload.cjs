const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("frogAPI", {
  openMenu: () => ipcRenderer.send("open-context-menu"),
  // Returns an unsubscribe fn so React effects can clean up (StrictMode
  // double-invokes effects in dev, which would otherwise register this twice).
  onAction: (callback) => {
    const listener = (_event, action) => callback(action);
    ipcRenderer.on("frog-action", listener);
    return () => ipcRenderer.removeListener("frog-action", listener);
  },
  resizeWindow: (size) => ipcRenderer.send("resize-window", size),
  dragWindow: (delta) => ipcRenderer.send("drag-window", delta),
  loadSave: () => ipcRenderer.invoke("load-save"),
  writeSave: (data) => ipcRenderer.send("write-save", data),
});
