const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const http = require('http')
const fs = require('fs')

const PORT = 3080
const URL = `http://127.0.0.1:${PORT}`

const HARNESS_ROOT = app.isPackaged
  ? path.resolve(__dirname, '..', '..', '..', '..', '..')
  : path.resolve(__dirname, '..', '..')

let mainWindow = null
let serverProcess = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'DSH',
    show: false,
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

function startServer() {
  const cliBin = path.join(HARNESS_ROOT, 'apps', 'cli', 'lib', 'bin.js')
  if (fs.existsSync(cliBin)) {
    serverProcess = spawn('node', [cliBin, '--profile', 'web'], {
      cwd: HARNESS_ROOT,
      stdio: 'ignore',
      detached: true,
    })
    serverProcess.unref()
  }
}

async function main() {
  await app.whenReady()
  startServer()
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 1000))
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(URL, { timeout: 2000 }, (res) => {
          if (res.statusCode === 200) resolve()
          else reject(new Error('Not ready'))
          res.destroy()
        })
        req.on('error', reject)
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')) })
      })
      break
    } catch {}
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