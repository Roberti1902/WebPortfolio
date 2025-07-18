
console.log("Cursor-Script läuft");

const fadeTexts = document.querySelectorAll(".fade-text");

function showOnScroll() {
    const triggerBottom = window.innerHeight * 0.45;

    fadeTexts.forEach(el => {
        const top = el.getBoundingClientRect().top;
        if (top < triggerBottom) {
            el.classList.add("visible");
        }
    });
}

window.addEventListener("scroll", showOnScroll);
window.addEventListener("load", showOnScroll);


document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".fade-container");

    if (!container) return;

    function showContainerOnScroll() {
        const triggerBottom = window.innerHeight * 0.25;
        const top = container.getBoundingClientRect().top;

        if (top < triggerBottom) {
            container.classList.add("visible");
            window.removeEventListener("scroll", showContainerOnScroll);
        }
    }

    window.addEventListener("scroll", showContainerOnScroll);
    showContainerOnScroll();
});

function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('de-DE', { hour12: false });

    const clockEl = document.getElementById("clock");
    if (clockEl) clockEl.textContent = time;
}

setInterval(updateClock, 1000);
updateClock();

document.addEventListener("DOMContentLoaded", () => {
    const copyBtn = document.getElementById("copyEmailBtn");
    const msg = document.getElementById("copiedMessage");

    if (copyBtn && msg) {
        copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText("ionescurobert117@yahoo.com").then(() => {
                msg.classList.add("visible");
                setTimeout(() => {
                    msg.classList.remove("visible");
                }, 2000);
            });
        });
    }
});

function isSommerzeit(date = new Date()) {
    const jahr = date.getFullYear();
    const start = new Date(jahr, 2, 31);
    while (start.getDay() !== 0) {
        start.setDate(start.getDate() - 1);
    }
    const end = new Date(jahr, 9, 31);
    while (end.getDay() !== 0) {
        end.setDate(end.getDate() - 1);
    }
    return date >= start && date < end;
}

const utcSpan = document.getElementById("tester");
if (utcSpan) {
    utcSpan.textContent = `(${isSommerzeit() ? "+2 UTC" : "+1 UTC"})`;
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
    const revealElements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.23 });

    revealElements.forEach(el => observer.observe(el));
});

function createMeteor() {
    const meteor = document.createElement("div");
    meteor.classList.add("meteor");

    // Zufällige Startposition
    meteor.style.left = Math.random() * window.innerWidth + "px";
    meteor.style.top = "-20px";

    // Zufällige Dauer
    const duration = 2 + Math.random() * 2;
    meteor.style.animationDuration = duration + "s";

    // In DOM einfügen
    document.body.appendChild(meteor);

    // Entfernen nach Animation
    setTimeout(() => {
        meteor.remove();
    }, duration * 1000);
}

// Regelmäßig Meteore erzeugen
setInterval(() => {
    if (document.hasFocus()) {
        createMeteor();
    }
}, 100);



document.addEventListener("DOMContentLoaded", () => {
    const flagElements = document.querySelectorAll('.lang-flag');

    function loadLanguage(lang) {
        fetch(`/locales/${lang}.json`)
            .then(res => res.json())
            .then(data => {
                document.querySelectorAll('[data-i18n]').forEach(el => {
                    const key = el.getAttribute('data-i18n');
                    const value = key.split('.').reduce((o, i) => o[i], data);
                    if (value) el.innerHTML = value;
                });

                // Flagge merken
                localStorage.setItem("language", lang);
            });
    }

    const savedLang = localStorage.getItem("language") || "en";
    loadLanguage(savedLang);

    flagElements.forEach(flag => {
        flag.addEventListener("click", () => {
            const selectedLang = flag.getAttribute("data-lang");
            loadLanguage(selectedLang);
        });
    });
});

