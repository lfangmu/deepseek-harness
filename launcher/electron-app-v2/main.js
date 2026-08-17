const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const http = require('http')

const PORT = 3080
const URL = `http://127.0.0.1:${PORT}`

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'DSH',
    show: false,
    icon: path.join(__dirname, 'dist', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  mainWindow.loadURL(URL)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  mainWindow.on('closed', () => { mainWindow = null })
  mainWindow.on('close', (e) => {
    e.preventDefault()
    mainWindow.hide()
  })
}

function isServerRunning() {
  return new Promise((resolve) => {
    const req = http.get(URL, { timeout: 2000 }, (res) => {
      resolve(res.statusCode === 200)
      res.destroy()
    })
    req.on('error', () => resolve(false))
    req.on('timeout', () => { req.destroy(); resolve(false) })
  })
}

async function main() {
  await app.whenReady()

  const alreadyRunning = await isServerRunning()
  if (!alreadyRunning) {
    // Server not running - try to start it
    const { spawn } = require('child_process')
    const fs = require('fs')
    const harnessRoot = path.resolve(__dirname, '..', '..')
    const cliBin = path.join(harnessRoot, 'apps', 'cli', 'lib', 'bin.js')

    if (fs.existsSync(cliBin)) {
      spawn('node', [cliBin, '--profile', 'web'], {
        cwd: harnessRoot,
        stdio: 'ignore',
      })
      // Wait for server
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 1000))
        if (await isServerRunning()) break
      }
    }
  }

  createWindow()

  ipcMain.handle('app:upgrade', () => {
    shell.openExternal('https://github.com/deepseek-ai/deepseek-harness/releases')
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}

main().catch(console.error)
