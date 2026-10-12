document.addEventListener("DOMContentLoaded", () => {
    const contactBar = document.querySelector(".fade-container");
    if (contactBar) {
        contactBar.getBoundingClientRect(); // Layout erzwingen, damit die Einblend-Transition startet
        contactBar.classList.add("visible");
    }
});

function updateClock() {
    const clockEl = document.getElementById("clock");
    if (clockEl) clockEl.textContent = new Date().toLocaleTimeString('de-DE', { hour12: false });
}

setInterval(updateClock, 1000);
updateClock();

const utcSpan = document.getElementById("tester");
if (utcSpan) {
    const offset = new Intl.DateTimeFormat("en", { timeZone: "Europe/Berlin", timeZoneName: "shortOffset" })
        .formatToParts().find(p => p.type === "timeZoneName").value; // z.B. "GMT+2"
    utcSpan.textContent = `(${offset.replace("GMT", "")} UTC)`;
}

document.addEventListener("DOMContentLoaded", () => {
    const trailLength = 8;
    const ghosts = [];

    const mainCursor = document.createElement("div");
    mainCursor.classList.add("custom-cursor");
    document.body.appendChild(mainCursor);

    console.log("Sehr interessant dich hier im Quellcode anzutreffen, willkommen auch an dich auf meinem Portfolio ;)");

    for (let i = 0; i < trailLength; i++) {
        const ghost = document.createElement("div");
        ghost.classList.add("ghost-cursor");
        document.body.appendChild(ghost);
        ghosts.push({ el: ghost, x: 0, y: 0 });
    }

    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateTrail() {
        mainCursor.style.transform = `translate(${mouseX - 10}px, ${mouseY - 10}px)`;

        let prevX = mouseX;
        let prevY = mouseY;

        ghosts.forEach((ghost, index) => {
            const delay = 0.45 - index * 0.02; // sanftere Verzögerung

            ghost.x += (prevX - ghost.x) * delay;
            ghost.y += (prevY - ghost.y) * delay;

            ghost.el.style.transform = `translate(${ghost.x - 10}px, ${ghost.y - 10}px)`;

            prevX = ghost.x;
            prevY = ghost.y;
        });

        requestAnimationFrame(animateTrail);
    }

    animateTrail();
});

document.addEventListener("DOMContentLoaded", () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.23 });

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

document.addEventListener("DOMContentLoaded", () => {
    function loadLanguage(lang) {
        fetch(`/locales/${lang}.json`)
            .then(res => res.json())
            .then(data => {
                document.querySelectorAll('[data-i18n]').forEach(el => {
                    const value = el.getAttribute('data-i18n').split('.').reduce((o, i) => o[i], data);
                    if (value) el.innerHTML = value;
                });

                localStorage.setItem("language", lang);
            });
    }

    loadLanguage(localStorage.getItem("language") || "en");

    document.querySelectorAll('.lang-flag').forEach(flag => {
        flag.addEventListener("click", () => loadLanguage(flag.getAttribute("data-lang")));
    });
});
