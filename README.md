# Personal Web Portfolio

![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-6db33f?style=flat-square)
![Thymeleaf](https://img.shields.io/badge/Thymeleaf-templates-005f0f?style=flat-square)
![i18n](https://img.shields.io/badge/languages-DE%20%7C%20EN%20%7C%20FR-3498db?style=flat-square)

Live: **[robertionescu.de](https://robertionescu.de)**

My personal portfolio: a landing page plus a tech portfolio, a 3D portfolio, an about page and project detail pages.
Server-rendered with Spring Boot and Thymeleaf, with a hand-written frontend (HTML, CSS, vanilla JavaScript) – no frontend framework.

## Highlights

- **Shared layout fragments** (`templates/fragments/layout.html`): head/SEO tags, navigation, language switch and footer are defined once and reused by every page.
- **Three languages (DE/EN/FR)**: texts live in `static/locales/*.json`; the language follows the browser setting, can be switched at any time and falls back to English for missing keys.
- **Responsive** from phone to desktop, `prefers-reduced-motion` respected, keyboard-operable controls.
- **Performance**: images served as WebP (74 MB → 3 MB), gzip compression, cache headers, lazy-loaded images.
- **SEO & sharing**: page titles, meta descriptions, canonical URLs, Open Graph image, `robots.txt`, `sitemap.xml`.
- **Security headers** (CSP, `nosniff`, referrer and permissions policy, HSTS over HTTPS) via a small servlet filter; custom 404 page.
- **UI details**: glassmorphism design, custom cursor with trail (mouse devices only), scroll reveal via `IntersectionObserver`, CSS-driven meteor background.

## Contact form

The landing page ends with a contact form: visitors choose **3D & Motion** or **IT & Software** (animated highlight in gold or blue), and the follow-up options adapt to that choice. Links like `/?topic=3d#contact` preselect an area.
In production the form posts to `deploy/contact.php` (PHP on the web host), which validates the input, blocks spam (honeypot, timing check, rate limit) and sends the request by mail. The recipient address lives in `contact-config.php` outside the web root and is never committed.

## Run locally

```bash
cd demo
./gradlew bootRun      # http://localhost:8080
./gradlew test         # page rendering, security headers, 404 page, translation keys
```

Requires JDK 21. Locally the form is answered by a stub (`DevContactController`) that only logs the request.

## Deploy (static web hosting, e.g. IONOS)

The host serves plain files, so the pages are exported as static HTML:

```bash
cd demo
./gradlew exportSite   # -> demo/build/site
```

Upload the **contents** of `demo/build/site` into `htdocs` (it includes `.htaccess` for clean URLs, security headers and caching, plus `contact.php`).
Once: copy `deploy/contact-config.example.php` to `contact-config.php`, fill in the addresses and upload it to `/` – one level **above** `htdocs`.

## Project structure

```
demo/src/main
├── java/com/example/demo       WebController (routes), SecurityHeadersFilter
└── resources
    ├── templates               one Thymeleaf template per page + fragments/layout.html
    └── static
        ├── css                 base.css (shared), one stylesheet per page, responsive.css
        ├── javascript/main.js  i18n, cursor, scroll reveal, clock, meteors
        ├── locales             de.json, en.json, fr.json
        └── Dateien             images (WebP)
```

### Adding a page

1. Create `templates/<name>.html` and include the fragments (`head`, `nav`, `flags`, `footer`) like the existing pages.
2. Add a route in `WebController` and an entry in `static/sitemap.xml`.
3. Put texts into the three `locales/*.json` files and reference them with `data-i18n="section.key"`. The test suite fails if a key is missing in `de.json` or `en.json`.
