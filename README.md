# Articulator Icons

**Articulator** is a lightweight, resolution-independent SVG icon renderer for the web.  
It uses percentage-based geometry to ensure your icons look sharp at any size or display density.

![Example](https://..)

---

## Features

- Fully **scalable vector icons** using SVG.
- Supports **lines and shapes**: menu, user, home, search, settings, plus, minus, check, close, arrowright, arrowleft, arrowup, arrowdown, bell, heart, lock, unlock, trash, download, upload, bookmark, play, pause, filter, list, wifi, pin, compass, laptop, tag, battery, batteryLow
- **Lightweight** and **self-contained**, svg dependencies only.
- Handles **stroke weight**(light and bold), and **colors**.  // solid is coming soon, colors re in terms of name only
- Designed for **custom elements** usage (`<articulator-icon>`).

---
## Example Usage

Render an icon using the `<articulator-icon>` custom element:

```html
<articulator-icon
    name="user"
    IconWeight="bold"
    size="2rem"
    color="green"
    class="Articulator-Icons">
</articulator-icon>

## Installation

Include via **jsDelivr** CDN:

```html
<!-- Latest version -->
<script src="https://cdn.jsdelivr.net/gh/Zachary-bungei/articulator/articulator.js"></script>

<!-- Or a specific version -->
<script src="https://cdn.jsdelivr.net/gh/Zachary-bungei/articulator/articulator.js"></script>
