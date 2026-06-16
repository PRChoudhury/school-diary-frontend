# PWA Icon Setup for SchoolDiary

## Overview
The PWA is now configured with the app name **"SchoolDiary"** and includes a custom icon design (notebook with pen and checkmark).

## Files Updated
- `public/manifest.webmanifest` - Updated app name to "SchoolDiary"
- `public/schooldiary-icon.svg` - Master SVG icon design

## Generate Icons

### Option 1: Using Node.js (Recommended)
```bash
cd school-diary-frontend
npm install sharp
node generate-icons.js
```

This will generate PNG icons in `public/icons/` at all required sizes:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

### Option 2: Online Tools
If you prefer not to install packages, use an online SVG to PNG converter:
1. Download `public/schooldiary-icon.svg`
2. Visit [CloudConvert](https://cloudconvert.com/svg-to-png) or similar tool
3. Convert SVG to PNG at each size listed above
4. Place files in `public/icons/` folder

### Option 3: ImageMagick (Command Line)
```bash
# Install ImageMagick first, then:
for size in 72 96 128 144 152 192 384 512; do
  convert -background white -resize ${size}x${size} public/schooldiary-icon.svg public/icons/icon-${size}x${size}.png
done
```

## Favicon
To update favicon.ico:
1. Use the generated `icon-192x192.png` or `icon-512x512.png`
2. Convert to ICO format using [convertio.co](https://convertio.co/) or ImageMagick
3. Save as `public/favicon.ico`

## Verification
After generating icons, verify PWA installation:
1. Build: `npm run build`
2. Serve the production build
3. Open DevTools → Application → Manifest
4. Should show "SchoolDiary" as app name
5. All icons should be properly referenced

## Icon Design Details
The SchoolDiary icon features:
- 📔 Open notebook with ruled lines (blue background)
- ✏️ Pen at an angle (gold/amber color)
- 🔒 Spiral binding on the left
- ✅ Green checkmark (task completion)
- 📅 Calendar reference

This design communicates the app's purpose: organizing and tracking school diary entries.
