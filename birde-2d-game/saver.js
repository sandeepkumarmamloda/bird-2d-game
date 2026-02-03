document.addEventListener("DOMContentLoaded", () => {
    const game = document.querySelector(".game-engine");
    const h2 = document.querySelector(".h2");
    const crosshair = document.getElementById("crosshair");

    if (!game || !h2 || !crosshair) return;

    // Disable text selection
    h2.style.userSelect = "none";
    h2.style.webkitUserSelect = "none";
    h2.style.mozUserSelect = "none";
    h2.style.msUserSelect = "none";

    const birdSVG = document.querySelector(".bird").innerHTML;

    let hiddenBirdsCount = 0;
    let activeBirds = 0;

    const birdSound = new Audio("angry-birds.mp3");
    birdSound.volume = 0.5;

    // ----------------- Mobile Detection -----------------
    const isMobileDevice = window.innerWidth < 950;

    // ----------------- Score Based Settings -----------------
    function getSpeedMultiplier() {
        let baseMultiplier;
        if (hiddenBirdsCount <= 15) baseMultiplier = 1;
        else if (hiddenBirdsCount <= 30) baseMultiplier = 1.5;
        else baseMultiplier = 2.2;

        if (isMobileDevice) baseMultiplier *= 1.3; 
        return baseMultiplier;
    }

    function getSpawnInterval() {
        let interval;
        if (hiddenBirdsCount <= 15) interval = 400;
        else if (hiddenBirdsCount <= 30) interval = 300;
        else interval = 200;

        if (isMobileDevice) interval *= 0.7; // faster spawn on mobile
        return interval;
    }

    function getMaxBirds() {
        if (hiddenBirdsCount <= 15) return 3;
        else if (hiddenBirdsCount <= 30) return 6;
        else return 9;
    }

    let lastSpeedMultiplier = getSpeedMultiplier();

    function showSpeedUpText() {
        const text = document.createElement("div");
        text.textContent = "SPEED UP!";
        text.style.position = "absolute";
        text.style.top = isMobileDevice ? "48%" : "40%";
        text.style.left = "50%";
        text.style.transform = "translate(-50%, -50%)";
        text.style.fontSize = "4vw";
        text.style.fontFamily = "Sprintura";
        text.style.fontWeight = "bold";
        text.style.color = "red";
        text.style.opacity = "1";
        text.style.pointerEvents = "none";
        game.appendChild(text);
        gsap.from(text, { duration: 0.3, opacity: 0, x: "-10px", yoyo: true, repeat: 1, onComplete: () => text.remove() });
    }
    // ----------------- Create Bird -----------------
    function createBirdCopy() {
        const currentSpeed = getSpeedMultiplier();
        if (currentSpeed > lastSpeedMultiplier) showSpeedUpText();
        lastSpeedMultiplier = currentSpeed;

        if (activeBirds >= getMaxBirds()) return;
        activeBirds++;

        const birdCopy = document.createElement("div");
        birdCopy.classList.add("bird");
        birdCopy.innerHTML = birdSVG;
        birdCopy.style.position = "absolute";
        birdCopy.style.transform = "scale(0)";
        game.appendChild(birdCopy);

        gsap.to(birdCopy, { duration: 0.3, scale: 1 });

        const birdHeight = birdCopy.offsetHeight;
        const birdWidth = birdCopy.offsetWidth;
        const gameHeight = game.clientHeight;
        const gameWidth = game.clientWidth; 

        const maxY = Math.max(0, gameHeight - birdHeight);
        const ypos = Math.random() * maxY;
        birdCopy.style.top = `${ypos}px`;

        const leftToRight = Math.random() > 0.5;
        const startX = leftToRight ? -birdWidth : gameWidth;
        const endX = leftToRight ? gameWidth : -birdWidth;
        birdCopy.style.left = `${startX}px`;

        // Mobile adjustment for speed
        let speed = (Math.random() * 3 + 3) / currentSpeed;
        if (isMobileDevice) speed /= 1.3; // faster on mobile

        const startTime = performance.now();

        function animate(time) {
            const progress = (time - startTime) / (speed * 1000);
            if (progress < 1) {
                const currentX = startX + (endX - startX) * progress;
                birdCopy.style.left = `${currentX}px`;
                requestAnimationFrame(animate);
            } else {
                gsap.to(birdCopy, {
                    duration: 0.3,
                    scale: 0,
                    onComplete: () => {
                        birdCopy.remove();
                        activeBirds--;
                    }
                });
            }
        }
        requestAnimationFrame(animate);

        birdCopy.addEventListener("click", () => {
            birdSound.currentTime = 0;
            birdSound.play();

            gsap.to(birdCopy, {
                duration: 0.2,
                scale: 0,
                onComplete: () => {
                    birdCopy.remove();
                    activeBirds--;
                    hiddenBirdsCount++;
                    h2.textContent = `YOUR-SCORE:${hiddenBirdsCount}`;
                }
            });
        });
    }

    // ----------------- Spawn Loop -----------------
    function spawnBirds() {
        createBirdCopy();
        setTimeout(spawnBirds, getSpawnInterval());
    }

    spawnBirds();
    // ------------------------changes------------------------
    setTimeout(() => {
    if (hiddenBirdsCount !== 50) {
        // Create overlay
        const overlay = document.createElement("div");
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = "9999";
        overlay.style.pointerEvents = "auto"; // allow overlay to capture events

        // Stop clicks from bubbling
        overlay.addEventListener("click", (event) => event.stopPropagation());
        overlay.addEventListener("mousedown", (event) => event.stopPropagation());
        overlay.addEventListener("touchstart", (event) => event.stopPropagation());

        // Create text
        const lostText = document.createElement("div");
        lostText.textContent = "YOU LOST!";
        lostText.style.fontSize = "5vw";
        lostText.style.fontFamily = "Sprintura";
        lostText.style.fontWeight = "bold";
        lostText.style.color = "red";
        lostText.style.opacity = "1";

        // Stop events on text as well
        lostText.addEventListener("click", (event) => event.stopPropagation());
        lostText.addEventListener("mousedown", (event) => event.stopPropagation());
        lostText.addEventListener("touchstart", (event) => event.stopPropagation());

        h2.style.display = "none"; // hide score
        overlay.appendChild(lostText);
        document.body.appendChild(overlay);
        game.appendChild(lostText);
        gsap.to(lostText, { 
            duration: 0.5, 
            opacity: 1, 
            scale: 0.5, 
            y: "-20px", 
            yoyo: true, 
            repeat: 1,
        });
    }
}, 60000);


    // --------------------------------------------
    // =============================================================crosshair animation==========================================================
// const crosshair = document.getElementById("crosshair");
const target = document.querySelector(".game-engine");

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let currentX = mouseX;
let currentY = mouseY;
const speed = 0.15;

// Check if device is mobile (screen width < 768px for example)
const isMobile = window.innerWidth < 950;

// Initially hide crosshair on mobile
if (isMobile) {
    crosshair.style.display = "none";
}

// Show crosshair only on non-mobile
if (!isMobile) {
    target.addEventListener("mouseenter", () => {
        crosshair.style.display = "block";
    });

    target.addEventListener("mouseleave", () => {
        crosshair.style.display = "none";
    });

    target.addEventListener("mousemove", e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animate() {
        if (crosshair.style.display !== "none") {
            currentX += (mouseX - currentX) * speed;
            currentY += (mouseY - currentY) * speed;

            crosshair.style.left = currentX + "px";
            crosshair.style.top = currentY + "px";
        }
        requestAnimationFrame(animate);
    }
    animate();

    target.addEventListener("mousedown", () => {
        gsap.to(crosshair, { scale: 1.6, duration: 0.1, ease: "power1.out" });
    });

    target.addEventListener("mouseup", () => {
        gsap.to(crosshair, { scale: 1, duration: 0.15, ease: "power1.out" });
    });
}
});
