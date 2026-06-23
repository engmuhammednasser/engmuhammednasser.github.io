# Muhammed Nasser Portfolio

This repository contains the statically exported website published with GitHub Pages.

## Local development

Requirements: Node.js 20 or newer.

```powershell
npm start
```

The site will be available at `http://127.0.0.1:3000`.

After replacing the static export, normalize its generated asset and English-language paths:

```powershell
npm run fix:paths
```

To verify that local page, image, stylesheet, and script references resolve:

```powershell
npm run check
```
