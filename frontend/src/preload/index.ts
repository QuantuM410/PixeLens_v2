import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),
  readDirectory: (dirPath: any) => ipcRenderer.invoke("read-directory", dirPath),
  readFile: (filePath: any) => ipcRenderer.invoke("read-file", filePath),
  writeFile: (filePath: any, content: any) => ipcRenderer.invoke("write-file", filePath, content),
  searchFiles: (projectPath: any, searchTerm: any) => ipcRenderer.invoke("search-files", projectPath, searchTerm),
  findAndApplyFix: (projectPath: any, issue: any) => ipcRenderer.invoke("find-and-apply-fix", projectPath, issue),

  // Shell operations
  openExternal: (url: any) => ipcRenderer.invoke("open-external", url),
  openPath: (path: any) => ipcRenderer.invoke("open-path", path),

  // Settings operations
  getSettings: () => ipcRenderer.invoke("get-settings"),
  saveSettings: (settings: any) => ipcRenderer.invoke("save-settings", settings),

  // Feedback operations
  saveFeedback: (messageId: any, feedback: any) => ipcRenderer.invoke("save-feedback", messageId, feedback),

  // Notification operations
  showNotification: (title: any, body: any) => ipcRenderer.invoke("show-notification", title, body),

  // Window operations
  minimizeWindow: () => ipcRenderer.invoke("minimize-window"),
  maximizeWindow: () => ipcRenderer.invoke("maximize-window"),
  closeWindow: () => ipcRenderer.invoke("close-window"),

  // Event listeners
  onProjectOpened: (callback: (arg0: any) => any) => {
    const listener = (_: any, projectPath: any) => callback(projectPath)
    ipcRenderer.on("project-opened", listener)
    return () => {
      ipcRenderer.removeListener("project-opened", listener)
    }
  },

  onExportReport: (callback: () => any) => {
    const listener = () => callback()
    ipcRenderer.on("export-report", listener)
    return () => {
      ipcRenderer.removeListener("export-report", listener)
    }
  },

  onToggleWorkspacePanel: (callback: () => any) => {
    const listener = () => callback()
    ipcRenderer.on("toggle-workspace-panel", listener)
    return () => {
      ipcRenderer.removeListener("toggle-workspace-panel", listener)
    }
  },

  onToggleIssuePanel: (callback: () => any) => {
    const listener = () => callback()
    ipcRenderer.on("toggle-issue-panel", listener)
    return () => {
      ipcRenderer.removeListener("toggle-issue-panel", listener)
    }
  },

  onOpenSettings: (callback: () => any) => {
    const listener = () => callback()
    ipcRenderer.on("open-settings", listener)
    return () => {
      ipcRenderer.removeListener("open-settings", listener)
    }
  },

  onShowAbout: (callback: () => any) => {
    const listener = () => callback()
    ipcRenderer.on("show-about", listener)
    return () => {
      ipcRenderer.removeListener("show-about", listener)
    }
  },

  onToggleMonitoring: (callback: (arg0: any) => any) => {
    const listener = (_: any, enabled: any) => callback(enabled)
    ipcRenderer.on("toggle-monitoring", listener)
    return () => {
      ipcRenderer.removeListener("toggle-monitoring", listener)
    }
  },
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
