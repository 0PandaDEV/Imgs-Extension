# Imgs

A browser extension to save images and media from any webpage with a single click or keyboard shortcut.

## Features

- Save images directly with Alt+S keyboard shortcut
- Right-click context menu for saving media
- Custom organization and management of saved media
- Works on all websites
- Simple and intuitive interface

## Installation

1. Firefox: Install from [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/imgs/) or [File (Releases)](https://github.com/0PandaDEV/Imgs-Extension/releases/download/v1.0.1/imgs-1.0.1.xpi)
2. Chrome: Install from [File (Releases)](https://github.com/0PandaDEV/Imgs-Extension/releases/download/v1.0.1/imgs-1.0.1.crx)

## Usage

- Hover over any image and press Alt+S to save it
- Right-click on images for additional save options
- Access saved media and settings through the extension popup

## Develop

### Prerequisites

- [Bun](https://bun.sh/) installed

### Setup

```bash
# Clone the repository
git clone https://github.com/0PandaDEV/Imgs-Extension.git
cd Imgs-Extension

# Install dependencies
bun install
```

### Development

```bash
# Run in development mode
bun dev
```

### Building

```bash
# Build the extension
bun run build:all
```

### Loading the extension

#### Firefox

1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file from the `dist` folder

#### Chrome

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder
