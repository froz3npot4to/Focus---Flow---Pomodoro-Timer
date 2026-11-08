let timerInterval = null;
let currentMode = "focus";
let timeLeft = 25 * 60;

const timeDisplay = document.getElementById("time-display");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const focusModeBtn = document.getElementById("focus-mode-btn");
const breakModeBtn = document.getElementById("break-mode-btn");
const ambientBtn = document.getElementById("ambient-btn");

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const paddedMins = mins < 10 ? `0${mins}` : mins;
    const paddedSecs = secs < 10 ? `0${secs}` : secs;
    return `${paddedMins}:${paddedSecs}`;
}

function updateDisplay() {
    const formatted = formatTime(timeLeft);
    timeDisplay.textContent = formatted;
    document.title = `${formatted} - ${currentMode === "focus" ? "Focus" : "Break"}`;
}

function startTimer() {
    if (timerInterval !== null) return;

    startBtn.disabled = true;
    pauseBtn.disabled = false;

    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            alert(currentMode === "focus" ? "Focus session complete! Take a Break." : "Break Over! Time to Focus.");
            switchMode(currentMode === "focus" ? "break" : "focus");
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

function resetTimer() {
    pauseTimer();
    timeLeft = currentMode === "focus" ? 25 * 60 : 5 * 60;
    updateDisplay();
}

function switchMode(newMode) {
    currentMode = newMode;
    pauseTimer();

    if (currentMode === "focus") {
        timeLeft = 25 * 60;
        focusModeBtn.classList.add("active");
        breakModeBtn.classList.remove("active");
    } else {
        timeLeft = 5 * 60;
        breakModeBtn.classList.add("active");
        focusModeBtn.classList.remove("active");
    }
    updateDisplay();
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);
focusModeBtn.addEventListener("click", () => switchMode("focus"));
breakModeBtn.addEventListener("click", () => switchMode("break"));

let audioCtx = null;
let noiseNode = null;
let isPlayingNoise = false;

function toggleNoise() {
    if (!isPlayingNoise) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      

    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);

    noiseNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    noiseNode.start();

    isPlayingNoise = true;
    ambientBtn.innerText = "Stop Ambient Noise";
    ambientBtn.style.backgroundColor = "#ef4444";
    } else {
        if (noiseNode) {
            noiseNode.stop();
            noiseNode.disconnect();
            noiseNode = null;
        }
        isPlayingNoise = false;
        ambientBtn.innerText = "Play White Noise";
        ambientBtn.style.backgroundColor = "#6366f1";
    }
}

ambientBtn.addEventListener("click", toggleNoise);

updateDisplay();
    