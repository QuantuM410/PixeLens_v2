import { app, shell, BrowserWindow, ipcMain, Tray, Menu, dialog, Notification } from 'electron';
import { join } from 'path';
import path from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/tray-icon.png?asset';

// Initialize databases
const dbPath = path.join(app.getPath("userData"), "pixelens");
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

const editHistoryDb = new sqlite3.Database(path.join(dbPath, "edit_history.db"));
const feedbackDb = new sqlite3.Database(path.join(dbPath, "feedback.db"));
const settingsDb = new sqlite3.Database(path.join(dbPath, "settings.db"));

// Initialize database tables
editHistoryDb.run(`
  CREATE TABLE IF NOT EXISTS edits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT,
    original_content TEXT,
    modified_content TEXT,
    timestamp INTEGER
  )
`);

feedbackDb.run(`
  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id TEXT,
    feedback TEXT,
    timestamp INTEGER
  )
`);

settingsDb.run(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`);

// Default settings
settingsDb.get("SELECT value FROM settings WHERE key = 'theme'", (_err, row) => {
  if (!row) {
    settingsDb.run("INSERT INTO settings (key, value) VALUES ('theme', 'dark')");
  }
});

settingsDb.get("SELECT value FROM settings WHERE key = 'notification_frequency'", (_err, row) => {
  if (!row) {
    settingsDb.run("INSERT INTO settings (key, value) VALUES ('notification_frequency', '5')");
  }
});

settingsDb.get("SELECT value FROM settings WHERE key = 'llm_temperature'", (_err, row) => {
  if (!row) {
    settingsDb.run("INSERT INTO settings (key, value) VALUES ('llm_temperature', '0.7')");
  }
});

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false,
    },
    frame: false,
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "frame-src *; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
          "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
          "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
          "img-src 'self' data:; " +
          "connect-src 'self' http://localhost:3000;"
        ],
      },
    });
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Open Project",
          accelerator: "CmdOrCtrl+O",
          click: async () => {
            const { canceled, filePaths } = await dialog.showOpenDialog({
              properties: ["openDirectory"],
            });
            if (!canceled && mainWindow) {
              mainWindow.webContents.send("project-opened", filePaths[0]);
            }
          },
        },
        {
          label: "Export Report",
          accelerator: "CmdOrCtrl+E",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send("export-report");
            }
          },
        },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
      ],
    },
    {
      label: "View",
      submenu: [
        {
          label: "Toggle Workspace Panel",
          accelerator: "CmdOrCtrl+1",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send("toggle-workspace-panel");
            }
          },
        },
        {
          label: "Toggle Issue Panel",
          accelerator: "CmdOrCtrl+2",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send("toggle-issue-panel");
            }
          },
        },
        {
          label: "Settings",
          accelerator: "CmdOrCtrl+,",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send("open-settings");
            }
          },
        },
        { type: "separator" },
        { role: "toggleDevTools" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Documentation",
          click: async () => {
            await shell.openExternal("https://pixelens.docs.example.com");
          },
        },
        {
          label: "About PixeLens",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send("show-about");
            }
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template as (Electron.MenuItemConstructorOptions | Electron.MenuItem)[]);
  Menu.setApplicationMenu(menu);

  const trayPath = path.join(__dirname, "../../resources/tray-icon.png");
  tray = new Tray(trayPath);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open PixeLens",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        } else {
          createWindow();
        }
      },
    },
    {
      label: "Toggle Background Monitoring",
      type: "checkbox",
      checked: true,
      click: (menuItem) => {
        if (mainWindow) {
          mainWindow.webContents.send("toggle-monitoring", menuItem.checked);
        }
      },
    },
    { type: "separator" },
    {
      label: "Exit",
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setToolTip("PixeLens");
  tray.setContextMenu(contextMenu);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.on('ping', () => console.log('pong'));

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle("open-file-dialog", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (canceled) {
    return null;
  }
  return filePaths[0];
});

ipcMain.handle("read-directory", async (_, dirPath) => {
  const files = await fs.promises.readdir(dirPath, { withFileTypes: true });
  return files.map((file) => ({
    name: file.name,
    isDirectory: file.isDirectory(),
    path: path.join(dirPath, file.name),
  }));
});

ipcMain.handle("read-file", async (_, filePath) => {
  try {
    const content = await fs.promises.readFile(filePath, "utf-8");
    return content;
  } catch (error) {
    console.error("Error reading file:", error);
    return null;
  }
});

ipcMain.handle("write-file", async (_, filePath, content) => {
  try {
    const originalContent = await fs.promises.readFile(filePath, "utf-8");
    await fs.promises.writeFile(filePath, content, "utf-8");
    editHistoryDb.run(
      "INSERT INTO edits (file_path, original_content, modified_content, timestamp) VALUES (?, ?, ?, ?)",
      [filePath, originalContent, content, Date.now()],
    );
    return true;
  } catch (error) {
    console.error("Error writing file:", error);
    return false;
  }
});

ipcMain.handle("open-external", async (_, url) => {
  await shell.openExternal(url);
  return true;
});

ipcMain.handle("open-path", async (_, path) => {
  await shell.openPath(path);
  return true;
});

ipcMain.handle("get-settings", async () => {
  return new Promise((resolve) => {
    settingsDb.all("SELECT key, value FROM settings", (err, rows) => {
      if (err) {
        resolve({});
        return;
      }
      const settings: Record<string, string> = {};
      rows.forEach((row: any) => {
        settings[row.key] = row.value;
      });
      resolve(settings);
    });
  });
});

ipcMain.handle("save-settings", async (_, settings: Record<string, string>) => {
  return new Promise((resolve) => {
    const stmt = settingsDb.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
    Object.entries(settings).forEach(([key, value]) => {
      stmt.run(key, value);
    });
    stmt.finalize();
    resolve(true);
  });
});

ipcMain.handle("save-feedback", async (_, messageId: string, feedback: string) => {
  return new Promise((resolve) => {
    feedbackDb.run(
      "INSERT INTO feedback (message_id, feedback, timestamp) VALUES (?, ?, ?)",
      [messageId, feedback, Date.now()],
      (err) => {
        resolve(!err);
      },
    );
  });
});

ipcMain.handle("show-notification", async (_, title: string, body: string) => {
  const notification = new Notification({
    title,
    body,
    icon: path.join(__dirname, "../../resources/tray-icon.png"),
  });
  notification.show();
  return true;
});

ipcMain.handle("minimize-window", async () => {
  if (mainWindow) {
    mainWindow.minimize();
    return true;
  }
  return false;
});

ipcMain.handle("maximize-window", async () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
    return true;
  }
  return false;
});

ipcMain.handle("close-window", async () => {
  if (mainWindow) {
    mainWindow.close();
    return true;
  }
  return false;
});

ipcMain.handle("search-files", async (_, dirPath: string, searchTerm: string) => {
  const results: { path: string; line: number; preview: string }[] = [];
  // Define directories to exclude
  const excludedDirs = new Set([
    'node_modules',
    'venv',
    '.venv',
    'dist',
    'build',
    '.git',
    '.next',
    'out',
    'target', // For Rust/Maven projects
  ]);

  const searchDirectory = async (currentPath: string) => {
    try {
      const files = await fs.promises.readdir(currentPath, { withFileTypes: true });

      for (const file of files) {
        const fullPath = path.join(currentPath, file.name);
        const baseName = file.name.toLowerCase();

        if (file.isDirectory()) {
          // Skip excluded directories
          if (excludedDirs.has(baseName)) {
            continue;
          }
          await searchDirectory(fullPath); // Recursively search subdirectories
        } else if (file.isFile()) {
          // Only search in common code file extensions
          const ext = path.extname(file.name).toLowerCase();
          const searchableExtensions = ['.js', '.ts', '.tsx', '.jsx', '.html', '.css', '.json'];
          if (!searchableExtensions.includes(ext)) continue;

          try {
            const content = await fs.promises.readFile(fullPath, "utf-8");
            const lines = content.split('\n');

            // Search for the term in each line
            lines.forEach((line, index) => {
              if (line.toLowerCase().includes(searchTerm.toLowerCase())) {
                results.push({
                  path: fullPath,
                  line: index + 1, // Line numbers are 1-based
                  preview: line.trim().substring(0, 100), // Limit preview to 100 characters
                });
              }
            });
          } catch (error) {
            console.error(`Error reading file ${fullPath}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`Error searching directory ${currentPath}:`, error);
    }
  };

  await searchDirectory(dirPath);
  return results;
});

// New intelligent search and fix application handler
ipcMain.handle("find-and-apply-fix", async (_, projectPath: string, issue: any) => {
  try {
    const { element, suggestedFix, type } = issue;
    
    // Define directories to exclude
    const excludedDirs = new Set([
      'node_modules', 'venv', '.venv', 'dist', 'build', '.git', '.next', 'out', 'target'
    ]);

    const searchResults: { path: string; line: number; content: string; matchType: string }[] = [];

    const searchDirectory = async (currentPath: string) => {
      try {
        const files = await fs.promises.readdir(currentPath, { withFileTypes: true });

        for (const file of files) {
          const fullPath = path.join(currentPath, file.name);
          const baseName = file.name.toLowerCase();

          if (file.isDirectory()) {
            if (excludedDirs.has(baseName)) continue;
            await searchDirectory(fullPath);
          } else if (file.isFile()) {
            const ext = path.extname(file.name).toLowerCase();
            const searchableExtensions = ['.js', '.ts', '.tsx', '.jsx', '.html', '.css', '.scss', '.less'];
            if (!searchableExtensions.includes(ext)) continue;

            try {
              const content = await fs.promises.readFile(fullPath, "utf-8");
              const lines = content.split('\n');

              // Search strategies based on issue type
              if (type === 'accessibility' && element) {
                // For accessibility issues, search for HTML elements
                const elementSelectors = element.split(',').map(s => s.trim());
                elementSelectors.forEach(selector => {
                  // Handle different selector types
                  if (selector.startsWith('.')) {
                    // Class selector
                    const className = selector.substring(1);
                    lines.forEach((line, index) => {
                      if (line.includes(`class="${className}"`) || line.includes(`class='${className}'`) || 
                          line.includes(`className="${className}"`) || line.includes(`className='${className}'`)) {
                        searchResults.push({
                          path: fullPath,
                          line: index + 1,
                          content: line,
                          matchType: 'class'
                        });
                      }
                    });
                  } else if (selector.startsWith('#')) {
                    // ID selector
                    const idName = selector.substring(1);
                    lines.forEach((line, index) => {
                      if (line.includes(`id="${idName}"`) || line.includes(`id='${idName}'`)) {
                        searchResults.push({
                          path: fullPath,
                          line: index + 1,
                          content: line,
                          matchType: 'id'
                        });
                      }
                    });
                  } else {
                    // Tag selector
                    lines.forEach((line, index) => {
                      if (line.includes(`<${selector}`) || line.includes(`<${selector} `)) {
                        searchResults.push({
                          path: fullPath,
                          line: index + 1,
                          content: line,
                          matchType: 'tag'
                        });
                      }
                    });
                  }
                });
              } else if (type === 'styling' && element) {
                // For styling issues, search for CSS selectors
                const elementSelectors = element.split(',').map(s => s.trim());
                elementSelectors.forEach(selector => {
                  lines.forEach((line, index) => {
                    if (line.includes(selector) && (line.includes('{') || line.includes(':'))) {
                      searchResults.push({
                        path: fullPath,
                        line: index + 1,
                        content: line,
                        matchType: 'css'
                      });
                    }
                  });
                });
              } else {
                // Fallback: search for any mention of the element or fix content
                const searchTerms = [element, suggestedFix].filter(Boolean);
                searchTerms.forEach(term => {
                  if (term) {
                    lines.forEach((line, index) => {
                      if (line.toLowerCase().includes(term.toLowerCase())) {
                        searchResults.push({
                          path: fullPath,
                          line: index + 1,
                          content: line,
                          matchType: 'fallback'
                        });
                      }
                    });
                  }
                });
              }
            } catch (error) {
              console.error(`Error reading file ${fullPath}:`, error);
            }
          }
        }
      } catch (error) {
        console.error(`Error searching directory ${currentPath}:`, error);
      }
    };

    await searchDirectory(projectPath);

    // If we found matches, try to apply the fix
    if (searchResults.length > 0) {
      // Sort by relevance (exact matches first)
      searchResults.sort((a, b) => {
        const aScore = a.matchType === 'class' || a.matchType === 'id' ? 1 : 0;
        const bScore = b.matchType === 'class' || b.matchType === 'id' ? 1 : 0;
        return bScore - aScore;
      });

      const bestMatch = searchResults[0];
      
      // Read the file content
      const fileContent = await fs.promises.readFile(bestMatch.path, "utf-8");
      const lines = fileContent.split('\n');
      
      // Apply the fix based on the issue type
      let modifiedContent = fileContent;
      let applied = false;

      if (type === 'accessibility') {
        // Handle accessibility fixes (like adding alt text)
        if (suggestedFix.includes('alt=')) {
          // Find the img tag and add alt attribute
          const imgRegex = /<img([^>]*?)>/gi;
          modifiedContent = fileContent.replace(imgRegex, (match, attributes) => {
            if (!attributes.includes('alt=')) {
              const altMatch = suggestedFix.match(/alt="([^"]*)"/);
              if (altMatch) {
                return `<img${attributes} alt="${altMatch[1]}">`;
              }
            }
            return match;
          });
          applied = true;
        }
      } else if (type === 'styling') {
        // Handle styling fixes
        if (suggestedFix.includes('color:') || suggestedFix.includes('background-color:')) {
          // Find CSS rules and update them
          const cssRegex = new RegExp(`(${element.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^}]*{)`, 'gi');
          modifiedContent = fileContent.replace(cssRegex, (match) => {
            // Add the suggested CSS properties
            return match.replace('{', `{\n  ${suggestedFix};`);
          });
          applied = true;
        }
      }

      // If we successfully applied a fix, write the file
      if (applied && modifiedContent !== fileContent) {
        await fs.promises.writeFile(bestMatch.path, modifiedContent, "utf-8");
        
        // Log the edit
        editHistoryDb.run(
          "INSERT INTO edits (file_path, original_content, modified_content, timestamp) VALUES (?, ?, ?, ?)",
          [bestMatch.path, fileContent, modifiedContent, Date.now()],
        );

        return {
          success: true,
          filePath: bestMatch.path,
          line: bestMatch.line,
          message: `Fix applied to ${bestMatch.path} at line ${bestMatch.line}`
        };
      }
    }

    return {
      success: false,
      message: "Could not automatically apply the fix. Please apply it manually.",
      searchResults: searchResults.map(r => ({ path: r.path, line: r.line, preview: r.content }))
    };

  } catch (error) {
    console.error("Error in find-and-apply-fix:", error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
});