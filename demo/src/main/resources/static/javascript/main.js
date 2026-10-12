const SUPPORTED_LANGS = ["de", "en", "fr"];
// Version aus ?v=... des eigenen Script-Tags: Sprachdateien werden nach Änderungen neu geladen statt aus dem Cache
const ASSET_VERSION = new URL(document.currentScript.src).searchParams.get("v") ?? "";

// Kontaktleiste (nur Hauptseite) einblenden
document.addEventListener("DOMContentLoaded", () => {
    const contactBar = document.querySelector(".fade-container");
    if (contactBar) {
        contactBar.getBoundingClientRect(); // Layout erzwingen, damit die Einblend-Transition startet
        contactBar.classList.add("visible");
    }
});

// Uhr: immer deutsche Zeit, unabhängig vom Standort des Besuchers
const berlinTime = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", hour12: false, timeStyle: "medium" });

function updateClock() {
    const clockEl = document.getElementById("clock");
    if (clockEl) clockEl.textContent = berlinTime.format(new Date());
}

if (document.getElementById("clock")) {
    setInterval(updateClock, 1000);
    updateClock();
}

const utcSpan = document.getElementById("tester");
if (utcSpan) {
    const offset = new Intl.DateTimeFormat("en", { timeZone: "Europe/Berlin", timeZoneName: "shortOffset" })
        .formatToParts().find(p => p.type === "timeZoneName").value; // z.B. "GMT+2"
    utcSpan.textContent = `(${offset.replace("GMT", "")} UTC)`;
}

// Eigener Cursor mit Schweif: nur bei Maus/Trackpad, Schweif nicht bei reduzierter Bewegung
document.addEventListener("DOMContentLoaded", () => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    document.documentElement.classList.add("has-custom-cursor");
    console.log("Sehr interessant dich hier im Quellcode anzutreffen, willkommen auch an dich auf meinem Portfolio ;)");

    const mainCursor = document.createElement("div");
    mainCursor.classList.add("custom-cursor");
    document.body.appendChild(mainCursor);

    const trailLength = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 8;
    const ghosts = [];
    for (let i = 0; i < trailLength; i++) {
        const ghost = document.createElement("div");
        ghost.classList.add("ghost-cursor");
        document.body.appendChild(ghost);
        ghosts.push({ el: ghost, x: 0, y: 0 });
    }

    let mouseX = 0;
    let mouseY = 0;
    let running = false;

    function animateTrail() {
        mainCursor.style.transform = `translate(${mouseX - 10}px, ${mouseY - 10}px)`;

        let prevX = mouseX;
        let prevY = mouseY;
        let moving = false;

        ghosts.forEach((ghost, index) => {
            const delay = 0.45 - index * 0.02; // sanftere Verzögerung

            ghost.x += (prevX - ghost.x) * delay;
            ghost.y += (prevY - ghost.y) * delay;
            if (Math.abs(prevX - ghost.x) > 0.1 || Math.abs(prevY - ghost.y) > 0.1) moving = true;

            ghost.el.style.transform = `translate(${ghost.x - 10}px, ${ghost.y - 10}px)`;

            prevX = ghost.x;
            prevY = ghost.y;
        });

        // Schleife läuft nur, solange sich etwas bewegt (spart CPU/Akku)
        if (moving) requestAnimationFrame(animateTrail);
        else running = false;
    }

    document.addEventListener("mousemove", (e) => {
        if (!mainCursor.classList.contains("visible")) {
            mainCursor.classList.add("visible");
            ghosts.forEach(g => { g.x = e.clientX; g.y = e.clientY; g.el.classList.add("visible"); });
        }
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!running) {
            running = true;
            requestAnimationFrame(animateTrail);
        }
    });
});

// Einblend-Animation beim Scrollen
document.addEventListener("DOMContentLoaded", () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0, rootMargin: "0px 0px -12% 0px" }); // threshold 0: auch sehr hohe Blöcke werden auf dem Handy sichtbar

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});

// Meteore: fester Pool, der endlos per CSS-Animation fällt (nur auf Seiten mit .meteor-field)
document.addEventListener("DOMContentLoaded", () => {
    const field = document.querySelector(".meteor-field");
    if (!field) return;

    for (let i = 0; i < 30; i++) {
        const meteor = document.createElement("div");
        meteor.className = "meteor";
        const duration = 2 + Math.random() * 2;
        meteor.style.left = Math.random() * 100 + "%";
        meteor.style.animationDuration = duration + "s";
        meteor.style.animationDelay = -Math.random() * duration + "s"; // verteilt den Start
        meteor.addEventListener("animationiteration", () => {
            meteor.style.left = Math.random() * 100 + "%";
        });
        field.appendChild(meteor);
    }
});

// Mehrsprachigkeit: Browsersprache als Standard, Auswahl wird gemerkt, fehlende Keys fallen auf Englisch zurück
document.addEventListener("DOMContentLoaded", () => {
    const flags = document.querySelectorAll('.lang-flag');
    const cache = {};

    function loadJson(lang) {
        cache[lang] ??= fetch(`/locales/${lang}.json?v=${ASSET_VERSION}`)
            .then(res => (res.ok ? res.json() : {}))
            .catch(() => ({}));
        return cache[lang];
    }

    const lookup = (data, key) => key.split('.').reduce((o, k) => o?.[k], data);

    async function loadLanguage(lang) {
        const [data, fallback] = await Promise.all([loadJson(lang), loadJson("en")]);

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const value = lookup(data, key) ?? lookup(fallback, key);
            if (value) el.innerHTML = value;
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const value = lookup(data, key) ?? lookup(fallback, key);
            if (value) el.placeholder = value;
        });

        document.documentElement.lang = lang;
        flags.forEach(flag => flag.classList.toggle("active", flag.dataset.lang === lang));
        try { localStorage.setItem("language", lang); } catch { /* Speicher gesperrt (z. B. privater Modus) */ }
    }

    let saved = null;
    try { saved = localStorage.getItem("language"); } catch { /* s. o. */ }
    const browserLang = navigator.language?.slice(0, 2);
    loadLanguage([saved, browserLang].find(l => SUPPORTED_LANGS.includes(l)) ?? "en");

    flags.forEach(flag => {
        const select = () => loadLanguage(flag.dataset.lang);
        flag.addEventListener("click", select);
        flag.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                select();
            }
        });
    });
});

// Kontaktformular: Bereich 3D/IT wählen (färbt Glow und Akzente), passende Auswahl einblenden, per fetch an contact.php senden
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const card = form.closest(".contact-card");
    const status = form.querySelector(".form-status");
    const submit = form.querySelector(".contact-submit");
    const needField = form.querySelector(".need-field");
    const msg = key => form.querySelector(`[data-msg="${key}"]`).textContent;

    function selectTopic(topic) {
        if (topic) card.dataset.topic = topic;
        else delete card.dataset.topic;
        form.querySelectorAll(".topic-hint").forEach(hint => { hint.hidden = hint.dataset.hint !== (topic || "none"); });
        needField.hidden = !topic;
        form.querySelectorAll(".need-select").forEach(select => {
            const active = select.dataset.topic === topic;
            select.hidden = !active;
            select.disabled = !active; // deaktivierte Felder werden nicht mitgeschickt
            select.required = active;
        });
    }

    form.querySelectorAll('input[name="topic"]').forEach(radio =>
        radio.addEventListener("change", () => {
            selectTopic(radio.value);
            status.textContent = "";
            status.className = "form-status";
        }));

    // Vorauswahl per Link, z. B. /?topic=3d#contact von der 3D-Seite
    const preset = new URLSearchParams(location.search).get("topic");
    const presetRadio = form.querySelector(`input[name="topic"][value="${preset}"]`);
    if (presetRadio) {
        presetRadio.checked = true;
        selectTopic(preset);
    }

    form.elements.started.value = Date.now(); // Bots schicken meist sofort ab, contact.php prüft die Zeit

    function showStatus(key, type) {
        status.textContent = msg(key);
        status.className = `form-status ${type}`;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!card.dataset.topic) {
            showStatus("chooseTopic", "error");
            form.querySelector(".topic-switch").scrollIntoView({ block: "center" });
            return;
        }
        if (!form.reportValidity()) return;

        submit.disabled = true;
        showStatus("sending", "");
        try {
            const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.ok) {
                form.reset();
                selectTopic(null);
                form.elements.started.value = Date.now();
                showStatus("success", "success");
            } else {
                showStatus(res.status === 429 ? "rate" : "error", "error");
            }
        } catch {
            showStatus("error", "error");
        } finally {
            submit.disabled = false;
        }
    });
});
