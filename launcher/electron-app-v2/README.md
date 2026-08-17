# DSH Desktop

Electron-based desktop client for DeepSeek Harness.

## Features

- Desktop window (no browser popup)
- System tray icon
- Auto-start DSH server if not running
- Upgrade & uninstall support

## Development

```bash
# Install dependencies
cd launcher/electron-app-v2
npm install

# Run in development
npm start

# Build installer
npm run build
```

## CI/CD

Builds are triggered automatically on push to main/master. Download artifacts from the Actions tab.

## License

MIT
