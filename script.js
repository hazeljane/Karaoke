const lyrics = [
  "Kung ako ay papalarin", "Na muli kang mahagkan", "Nais kong malaman mo",
  "Ang laman ng puso ko", "", "Sana'y mapansin mo", "Ang mga pagtingin ko",
  "Sana ay marinig mo", "Ang awit kong ito", "", "Na para sa'yo",
  "Sana maulit muli", "Ang mga oras nating nakaraan", "Bakit nagkaganito", "",
  "Naglaho na ba ang pag-ibig mo", "Sana maulit muli", "Sana bigyan pansin",
  "Ang himig ko", "Kahapon, bukas, ngayon", "", "Tanging wala nang ibang mahal",
  "Kung hindi ikaw", "Kung ako ay papalarin", "Na ikaw ay mahalikan",
  "Muling manumbalik", "Ang tamis ng kahapon", "", "Sana maulit muli",
  "Ang mga oras nating nakaraan", "Bakit nagkaganito", "Naglaho na ba ang pag-ibig mo",
  "Sana maulit muli", "Sana bigyang pansin", "Ang himig ko", "Kahapon, bukas, ngayon", "",
  "Tanging wala nang ibang mahal", "Kung hindi ikaw", "Kung hindi ikaw", "Kung hindi ikaw"
];

const container = document.getElementById("lyricsContainer");
const playBtn = document.getElementById("mainPlayBtn");
const playIcon = document.getElementById("mainIcon");
const artistPlayBtn = document.getElementById("artistPlay");
const artistIcon = document.getElementById("artistIcon");
const backBtn = document.getElementById("backBtn");
const skipBtn = document.getElementById("skipBtn");
const timerDisplay = document.getElementById("timer");
const circle = document.getElementById("circle");
const progressFill = document.getElementById("progressFill");
const progressLine = document.querySelector('.progress-line');

const totalDuration = 120; // seconds
let lineIndex = 0, wordIndex = 0, currentLine = null, words = [];
let isPlaying = false, timeoutId = null;
let startTime = null, pausedTime = 0, timerInterval = null;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function startTimer() {
  startTime = Date.now() - pausedTime * 1000;
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.textContent = formatTime(elapsed);
    updateProgress(elapsed);
  }, 500);
}

function pauseTimer() {
  clearInterval(timerInterval);
  pausedTime = Math.floor((Date.now() - startTime) / 1000);
}

function resetTimer() {
  timerDisplay.textContent = formatTime(pausedTime);
  updateProgress(pausedTime);
}

function updateProgress(seconds) {
  const width = progressLine.offsetWidth;
  const progress = Math.min(seconds / totalDuration, 1);
  const circlePosition = progress * width;

  progressFill.style.width = `${progress * 100}%`;
  circle.style.left = `${circlePosition}px`;
}

function showNextWord() {
  if (!isPlaying) return;

  if (!currentLine && lineIndex < lyrics.length) {
    const lineText = lyrics[lineIndex];
    currentLine = document.createElement("div");
    currentLine.classList.add("line");

    if (lineText.trim() === "") {
      currentLine.innerHTML = "<br>";
      container.appendChild(currentLine);
      container.scrollTop = container.scrollHeight;
      lineIndex++;
      currentLine = null;
      timeoutId = setTimeout(showNextWord, 600);
      return;
    }

    words = lineText.split(" ").map(word => {
      const span = document.createElement("span");
      span.classList.add("word");
      span.textContent = word + " ";
      currentLine.appendChild(span);
      return span;
    });

    container.appendChild(currentLine);
    container.scrollTop = container.scrollHeight;
    wordIndex = 0;
  }

  if (words.length > 0 && wordIndex < words.length) {
    words[wordIndex].classList.add("active");
    wordIndex++;
    timeoutId = setTimeout(showNextWord, 350);
  } else {
    lineIndex++;
    currentLine = null;
    if (lineIndex < lyrics.length) {
      timeoutId = setTimeout(showNextWord, 600);
    }
  }
}

function resetLyricsTo(time) {
  const progressRatio = time / totalDuration;
  const approxWords = Math.floor(progressRatio * lyrics.join(' ').split(' ').length);

  container.innerHTML = "";
  lineIndex = 0;
  wordIndex = 0;
  currentLine = null;
  words = [];

  let count = 0;
  for (let i = 0; i < lyrics.length && count < approxWords; i++) {
    const lineText = lyrics[i];
    const lineDiv = document.createElement("div");
    lineDiv.classList.add("line");

    if (lineText.trim() === "") {
      lineDiv.innerHTML = "<br>";
      container.appendChild(lineDiv);
      count++;
      continue;
    }

    const lineWords = lineText.split(" ");
    lineWords.forEach(word => {
      const span = document.createElement("span");
      span.classList.add("word");
      span.textContent = word + " ";
      if (count < approxWords) span.classList.add("active");
      lineDiv.appendChild(span);
      count++;
    });

    container.appendChild(lineDiv);
  }

  container.scrollTop = container.scrollHeight;
}

function togglePlayback() {
  isPlaying = !isPlaying;

  if (isPlaying) {
    playIcon.classList.replace("bx-play", "bx-pause");
    artistIcon.classList.replace("bx-play", "bx-pause");
    startTimer();
    showNextWord();
  } else {
    playIcon.classList.replace("bx-pause", "bx-play");
    artistIcon.classList.replace("bx-pause", "bx-play");
    pauseTimer();
    clearTimeout(timeoutId);
  }
}

// Play / Pause Buttons (main + artist)
playBtn.addEventListener("click", togglePlayback);
artistPlayBtn.addEventListener("click", togglePlayback);

// Back Button
backBtn.addEventListener("click", () => {
  pausedTime = Math.max(pausedTime - 5, 0);
  resetTimer();
  resetLyricsTo(pausedTime);
  clearTimeout(timeoutId);
  if (isPlaying) {
    clearInterval(timerInterval);
    startTimer();
    showNextWord();
  }
});

// Skip Button
skipBtn.addEventListener("click", () => {
  pausedTime = Math.min(pausedTime + 5, totalDuration);
  resetTimer();
  resetLyricsTo(pausedTime);
  clearTimeout(timeoutId);
  if (isPlaying) {
    clearInterval(timerInterval);
    startTimer();
    showNextWord();
  }
});

// Click to Seek
progressLine.addEventListener("click", (e) => {
  const rect = progressLine.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const width = progressLine.offsetWidth;
  const ratio = x / width;
  const newTime = Math.floor(totalDuration * ratio);

  pausedTime = newTime;
  resetTimer();
  resetLyricsTo(pausedTime);
  clearTimeout(timeoutId);
  if (isPlaying) {
    clearInterval(timerInterval);
    startTimer();
    showNextWord();
  }
});

// Drag to Seek
let isDragging = false;
circle.addEventListener("mousedown", () => {
  isDragging = true;
  pauseTimer();
  clearTimeout(timeoutId);
  document.body.style.userSelect = "none";
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const rect = progressLine.getBoundingClientRect();
  let x = e.clientX - rect.left;
  x = Math.max(0, Math.min(x, rect.width));

  const ratio = x / rect.width;
  const newTime = Math.floor(totalDuration * ratio);
  pausedTime = newTime;
  resetTimer();
  resetLyricsTo(pausedTime);
});

document.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    if (isPlaying) {
      clearInterval(timerInterval);
      startTimer();
      showNextWord();
    }
    document.body.style.userSelect = "";
  }
});

// Initialize
resetTimer();
