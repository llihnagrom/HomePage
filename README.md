# HomePage

A local browser home page for quick access to websites, folders, apps, and shortcuts.

## Features

- Live clock and date.
- Centered Google search that opens results in a new tab.
- Bookmark-style tiles with editable names, URLs, categories, colors, and icons.
- Import browser bookmarks from an exported `.html` file.
- List view for bulk editing links.
- CSV import/export for homepage links.
- Custom categories and page layout settings.
- Update check against the configured GitHub repository.
- Local folder and app launching through the `homepage-launch:` Windows protocol.

## Add Links

Use the plus tile, or open `Page options > List view`.

The `URL, folder, or app path` field accepts:

```text
https://example.com
I:\HomePage
C:\Users\morganh\Documents
\\server\share\folder
C:\Program Files\Some App\App.exe
C:\Users\morganh\Desktop\Some Shortcut.lnk
```

Website links open normally in the browser. Folder links open in File Explorer. App paths and shortcuts launch through Windows.

## Google Search

Type a search in the white search box beside the clock and press `Enter` or `Go`. Results open in a new browser tab.

## Folder And App Launcher

Folder and app launching uses a local Windows protocol handler:

```text
homepage-launch:
```

The launcher files are:

- `homepage_launcher.py`
- `homepage_launcher.exe`
- `install_homepage_launcher.ps1`

The protocol has already been registered for the current Windows user. To register it again after moving the project folder, run PowerShell:

```powershell
powershell.exe -ExecutionPolicy Bypass -File "I:\HomePage\install_homepage_launcher.ps1"
```

The first time a browser opens a folder or app tile, it may ask for permission to open `homepage-launch`. Allow it to continue.

## Launcher Notes

- Folders are opened with File Explorer.
- `.exe`, `.lnk`, `.url`, and `.appref-ms` targets are launched with Windows.
- The launcher only opens local file targets passed from the homepage.
- If a path no longer exists, the launcher shows a small error dialog.
- Normal use does not require Python when `homepage_launcher.exe` is present.

## Files

- `index.html` - page markup and dialogs.
- `styles.css` - visual styling and responsive layout.
- `script.js` - tiles, settings, import/export, update check, and launch-link behavior.
- `homepage_launcher.py` - source for the Windows launcher.
- `homepage_launcher.exe` - standalone Windows launcher used by the protocol handler.
- `install_homepage_launcher.ps1` - registers the `homepage-launch:` protocol for the current user.

## Troubleshooting

If folder or app tiles do not open:

1. Re-run `install_homepage_launcher.ps1`.
2. Check that `homepage_launcher.exe` exists beside `install_homepage_launcher.ps1`.
3. Check that the folder, app, or shortcut path still exists.
4. If the browser asks whether to open `homepage-launch`, allow it.

If a website tile opens incorrectly, make sure it starts with `https://` or `http://`.
