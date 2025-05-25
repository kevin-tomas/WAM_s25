let currentSecond = 0;
let currentMinute = 0;
let currentHour = 0;
let currentBackHour = 0;
let currentForwardHour = 0;

const messages = [
    "Hi Mom!",
    "Love You!",
    "Have a Good Day :)",
    "Miss You!",
    "🌻 🌻 🌻 ",
    "🌸 🌸 🌸",
    "🌼 🌼 🌼",
    "🌷 🌷 🌷"

];
let currentMessagePopup = null;
let currentMessageIndex = null;

function updateClock() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    const hourPos = h >= 12 ? h - 12 : h + 12;
    const hourTurn = (15 * hourPos + m / 4) % 360;
    const minuteTurn = 6 * m;
    const secondTurn = 6 * s;

    let backHourPos = ((h - 2) >= 12) ? (h - 2) - 12 : (h - 2) + 12;
    if (backHourPos < 0) backHourPos += 24;
    const backHourTurn = (15 * backHourPos + m / 4) % 360;

    let forwardHourPos = ((h + 10) >= 12) ? (h + 6) - 12 : (h + 6) + 12;
    if (forwardHourPos >= 24) forwardHourPos -= 24;
    const forwardHourTurn = (15 * forwardHourPos + m / 4) % 360;

    function smoothUpdate(currentVal, targetVal) {
        let delta = (targetVal - currentVal) % 360;
        if (delta < -180) return currentVal + (delta + 360) / 60;
        if (delta > 180) return currentVal + (delta - 360) / 60;
        return currentVal + delta / 60;
    }

    currentHour = smoothUpdate(currentHour, hourTurn);
    document.getElementById('hour_hand').style.transform = `rotate(${currentHour}deg)`;

    currentMinute = smoothUpdate(currentMinute, minuteTurn);
    document.getElementById('min_hand').style.transform = `rotate(${currentMinute}deg)`;

    currentSecond = smoothUpdate(currentSecond, secondTurn);
    document.getElementById('sec_hand').style.transform = `rotate(${currentSecond}deg)`;

    currentBackHour = smoothUpdate(currentBackHour, backHourTurn);
    document.getElementById('hour_backhand').style.transform = `rotate(${currentBackHour}deg)`;

    currentForwardHour = smoothUpdate(currentForwardHour, forwardHourTurn);
    document.getElementById('hour_forwardhand').style.transform = `rotate(${currentForwardHour}deg)`;

    requestAnimationFrame(updateClock);
}

function getRotationDegrees(element) {
    const transform = window.getComputedStyle(element).getPropertyValue('transform');
    if (transform === 'none') return 0;

    const match = transform.match(/^matrix\((.+)\)$/);
    if (!match) return 0;

    const [a, b] = match[1].split(', ').map(parseFloat);
    return Math.round(Math.atan2(b, a) * (180 / Math.PI));
}

function updateDotColors() {
    const hourDot = document.querySelector('.hour_dot');
    const backHourDot = document.querySelector('.back_hour_dot');
    const forwardHourDot = document.querySelector('.forward_hour_dot');

    function calculateColor(rotation) {
        let angle = rotation % 360;
        if (angle < 0) angle += 360;
        const factor = (Math.cos(angle * Math.PI / 180) + 1) / 2;
        const value = Math.round(255 * factor);
        return `rgb(${value}, ${value}, ${value})`;
    }

    if (hourDot) hourDot.style.backgroundColor = calculateColor(getRotationDegrees(document.getElementById('hour_hand')));
    if (backHourDot) backHourDot.style.backgroundColor = calculateColor(getRotationDegrees(document.getElementById('hour_backhand')));
    if (forwardHourDot) forwardHourDot.style.backgroundColor = calculateColor(getRotationDegrees(document.getElementById('hour_forwardhand')));

    requestAnimationFrame(updateDotColors);
}

function updateCallButtonStates() {
    const hour = new Date().getHours();
    const erinHour = (hour + 6) % 24;

    const isKevinAvailable = hour >= 9 && hour < 22;
    const isErinAvailable = erinHour >= 7 && erinHour < 21; 

    const kevinBtn = document.getElementById('call-kevin-btn');
    const erinBtn = document.getElementById('call-erin-btn');

    if (kevinBtn) {
        kevinBtn.disabled = !isKevinAvailable;
        kevinBtn.onclick = isKevinAvailable ? () => window.open("https://www.whatsapp.com/", "_blank") : null;
    }

    if (erinBtn) {
        erinBtn.disabled = !isErinAvailable;
        erinBtn.onclick = isErinAvailable ? () => window.open("https://www.whatsapp.com/", "_blank") : null;
    }

    requestAnimationFrame(updateCallButtonStates);

    console.log("Is Kevin available:", isKevinAvailable);
    console.log("Is Erin available:", isErinAvailable);
}

function showMessage(index = null) {
    if (currentMessagePopup) {
        document.body.removeChild(currentMessagePopup);
        currentMessagePopup = null;
    }

    if (index === null) {
        index = Math.floor(Math.random() * messages.length);
    }

    const popup = document.createElement('div');
    popup.className = 'message-popup';
    popup.textContent = messages[index];

    document.body.appendChild(popup);

    currentMessagePopup = popup;
    currentMessageIndex = index;
}

function setupMessageButton() {
    const btn = document.getElementById('message-btn');
    if (!btn) return;

    if (btn.textContent.includes("available")) {
        btn.textContent = btn.textContent.replace(/available/gi, "").trim();
    }

    btn.addEventListener('click', () => {
        let next = currentMessageIndex;
        if (messages.length > 1) {
            do {
                next = Math.floor(Math.random() * messages.length);
            } while (next === currentMessageIndex);
        }
        showMessage(next);
    });
}

function loadRandomMessageOnPageLoad() {
    showMessage(Math.floor(Math.random() * messages.length));
}

// Initial animation frame requests
requestAnimationFrame(updateClock);
requestAnimationFrame(updateDotColors);

// DOM Ready setup
document.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(updateCallButtonStates);
    setupMessageButton();
    loadRandomMessageOnPageLoad();
});
