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
const progressBar = document.getElementById("progress-bar");

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

    const totalDuration = currentMode === "focus" ? 25 * 60 : 5 * 60;
    const percentage = (timeLeft / totalDuration) * 100;
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
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
            playNotificationBeep();
            alert(currentMode === "focus" ? "Focus session complete! Take a break." : "Break over! Time to focus.");
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
        ambientBtn.style.backgroundColor = "";
    }
}

function playNotificationBeep() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5 note
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
}

ambientBtn.addEventListener("click", toggleNoise);

updateDisplay();

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    if (timerInterval !== null) {
      pauseTimer();
    } else {
      startTimer();
    }
  } else if (e.key.toLowerCase() === "r") {
    resetTimer();
  }
});