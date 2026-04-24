# HomePage

A customizable browser start page for keeping favorite links in a clean tile grid.

HomePage is a static HTML, CSS, and JavaScript project. It runs entirely in the browser, stores your links and settings in `localStorage`, and does not require a backend or build step.

## Features

- Live clock and date header
- Editable link tiles with favicons
- Drag-and-drop tile ordering
- Custom categories with per-category colors
- Browser bookmark HTML import
- List view for bulk editing links
- CSV import and export from list view
- Custom icon support through image URLs or uploaded files
- Theme controls for background, accent, panel color, width, spacing, and tile scale

## Run Locally

Open `index.html` in a browser.

No install step is needed. The project is made of:

- `index.html` - page structure and dialogs
- `styles.css` - layout, theme, and responsive styling
- `script.js` - app state, imports, exports, editing, and persistence

## Data Storage

Links and settings are stored in the browser under these `localStorage` keys:

- `local-homepage-links`
- `local-homepage-settings`

Because the data is local to the browser, use CSV export or browser bookmark export if you want a portable backup.

## Importing Bookmarks

Use the page menu and choose **Import bookmarks**, then select an exported browser bookmarks file (`.html` or `.htm`). HomePage will show the discovered bookmarks so you can choose which ones to add.

## CSV Format

The list view can import and export CSV rows with these fields:

```csv
Icon,Title,URL,Category
```

The icon value can be blank, an image URL, or a data URL.

## GitHub Pages

This project can be hosted directly with GitHub Pages because it is a static site. Set Pages to deploy from the `main` branch and the repository root.
