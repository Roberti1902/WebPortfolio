
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
    document.getElementById("clock").textContent = time;
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