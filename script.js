/* =====================================================================
   A LETTER FOR MY MALKIN — SCRIPT
   Handles: envelope opening, camera zoom, typing animation, decorations,
   the music player, and the replay flow.
===================================================================== */

/* ---------------------------------------------------------------------
   PASTE YOUR LETTER HERE
   Replace the sample paragraphs below with your own text. Each array
   entry becomes one paragraph, typed out one at a time. Nothing else
   in the file needs to change.
--------------------------------------------------------------------- */
const LETTER_TEXT = [
  "This is a placeholder paragraph. Replace everything inside the LETTER_TEXT array at the top of script.js with your own words — each line in this array becomes one paragraph on the page.",
  "Write it the way you would actually speak to her: slowly, honestly, without rushing to the next sentence. The typing animation will take care of the pacing.",
  "You can add as many paragraphs as you like — the letter will simply grow longer, and the page will scroll gently while it types.",
  "Some paragraphs will glow very softly in pink behind them — those are the emotional ones. You can mark which ones by adding their paragraph index to the EMOTIONAL_PARAGRAPHS array below.",
];

// Indexes (0-based) of paragraphs that should get the soft pink glow behind them
const EMOTIONAL_PARAGRAPHS = [1, 3];

/* =====================================================================
   ELEMENT REFERENCES
===================================================================== */
const envelopeScreen = document.getElementById('envelope-screen');
const letterScreen   = document.getElementById('letter-screen');
const envelope       = document.getElementById('envelope');
const openBtn        = document.getElementById('open-btn');
const replayBtn      = document.getElementById('replay-btn');

const letterBody     = document.getElementById('letter-body');
const signatureEl    = document.getElementById('letter-signature');
const finalScene     = document.getElementById('final-scene');
const paperEl        = document.getElementById('paper');

const musicPlayer    = document.getElementById('music-player');
const audio          = document.getElementById('bg-audio');
const playPauseBtn   = document.getElementById('play-pause-btn');
const iconPlay       = document.getElementById('icon-play');
const iconPause      = document.getElementById('icon-pause');
const progressBar    = document.getElementById('progress-bar');
const volumeBar      = document.getElementById('volume-bar');
const timeCurrent    = document.getElementById('time-current');
const timeTotal      = document.getElementById('time-total');

const petalLayer     = document.getElementById('petal-layer');
const heartsLayer    = document.getElementById('hearts-layer');
const cursorLayer    = document.getElementById('cursor-layer');

let floatingHeartsTimer = null;
let typingInProgress = false;

/* =====================================================================
   ENVELOPE OPENING SEQUENCE
===================================================================== */
openBtn.addEventListener('click', () => {
  openBtn.disabled = true;
  envelope.classList.add('opened');

  // start music softly, right when the seal breaks
  startMusic();

  // let the envelope + paper-peek animation play, then transition scenes
  setTimeout(() => {
    envelopeScreen.classList.add('fading-out');
    letterScreen.classList.remove('hidden');

    // force reflow so the transition below is picked up
    void letterScreen.offsetWidth;

    setTimeout(() => {
      letterScreen.classList.add('visible');
      envelopeScreen.style.display = 'none';
      musicPlayer.classList.remove('hidden');
      beginLetterExperience();
    }, 120);
  }, 1250);
});

/* =====================================================================
   LETTER EXPERIENCE — typing, glows, signature, final scene
===================================================================== */
async function beginLetterExperience(){
  resetLetterDom();
  startFloatingHearts();
  typingInProgress = true;

  for (let i = 0; i < LETTER_TEXT.length; i++){
    await typeParagraph(LETTER_TEXT[i], i);
    if (EMOTIONAL_PARAGRAPHS.includes(i)) revealNearestGlow(i);
    await wait(650); // pause between paragraphs
  }

  typingInProgress = false;

  // signature fades in slowly
  await wait(300);
  signatureEl.classList.remove('hidden');
  requestAnimationFrame(() => signatureEl.classList.add('show'));

  // final scene: petals + heartbeat + closing message
  await wait(1800);
  triggerFinalScene();
}

function resetLetterDom(){
  letterBody.innerHTML = '';
  signatureEl.classList.add('hidden');
  signatureEl.classList.remove('show');
  finalScene.classList.add('hidden');
  finalScene.classList.remove('show');
  document.querySelectorAll('.glow-heart-decor').forEach(g => g.classList.remove('show'));
}

/**
 * Types a single paragraph into #letter-body one character at a time,
 * with a blinking cursor, then leaves the finished <p> in place.
 */
function typeParagraph(text, index){
  return new Promise(resolve => {
    const p = document.createElement('p');
    p.dataset.index = index;
    letterBody.appendChild(p);

    const cursor = document.createElement('span');
    cursor.className = 'type-cursor';

    let i = 0;
    const speed = 22; // ms per character — natural handwriting pace

    (function tick(){
      if (i < text.length){
        p.textContent = text.slice(0, i + 1);
        p.appendChild(cursor);
        i++;

        // keep the page smoothly following the writing
        cursor.scrollIntoView({ block: 'center', behavior: 'smooth' });

        setTimeout(tick, speed);
      } else {
        cursor.remove();
        resolve();
      }
    })();
  });
}

function revealNearestGlow(paragraphIndex){
  const glows = document.querySelectorAll('.glow-heart-decor');
  const glow = glows[paragraphIndex % glows.length];
  if (glow) glow.classList.add('show');
}

function triggerFinalScene(){
  finalScene.classList.remove('hidden');
  requestAnimationFrame(() => finalScene.classList.add('show'));
  spawnPetals(26);
}

function wait(ms){ return new Promise(r => setTimeout(r, ms)); }

/* =====================================================================
   REPLAY
===================================================================== */
replayBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(beginLetterExperience, 500);
});

/* =====================================================================
   FLOATING HEARTS (ambient, every few seconds)
===================================================================== */
function startFloatingHearts(){
  if (floatingHeartsTimer) return;
  floatingHeartsTimer = setInterval(() => {
    const heart = document.createElement('span');
    heart.className = 'float-heart';
    heart.textContent = '❤';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
    heart.style.animationDuration = (7 + Math.random() * 4) + 's';
    heartsLayer.appendChild(heart);
    setTimeout(() => heart.remove(), 12000);
  }, 3200);
}

/* =====================================================================
   ROSE PETALS — final scene
===================================================================== */
function spawnPetals(count){
  for (let i = 0; i < count; i++){
    setTimeout(() => {
      const petal = document.createElement('span');
      petal.className = 'petal';
      petal.textContent = Math.random() > 0.5 ? '❀' : '❁';
      petal.style.left = Math.random() * 100 + 'vw';
      petal.style.setProperty('--drift', (Math.random() * 120 - 60) + 'px');
      petal.style.animationDuration = (5 + Math.random() * 3) + 's';
      petalLayer.appendChild(petal);
      setTimeout(() => petal.remove(), 9000);
    }, i * 120);
  }
}

/* =====================================================================
   HEART PARTICLE CURSOR EFFECT
===================================================================== */
let lastCursorSpawn = 0;
document.addEventListener('pointermove', (e) => {
  const now = Date.now();
  if (now - lastCursorSpawn < 90) return; // throttle
  lastCursorSpawn = now;

  const heart = document.createElement('span');
  heart.className = 'cursor-heart';
  heart.textContent = '♥';
  heart.style.left = e.clientX + 'px';
  heart.style.top = e.clientY + 'px';
  cursorLayer.appendChild(heart);
  setTimeout(() => heart.remove(), 950);
});

/* =====================================================================
   MUSIC PLAYER
===================================================================== */
function startMusic(){
  audio.volume = parseFloat(volumeBar.value);
  const playPromise = audio.play();
  if (playPromise !== undefined){
    playPromise
      .then(() => setPlayingUI(true))
      .catch(() => {
        // Autoplay may be blocked, or assets/music.mp3 hasn't been added yet.
        setPlayingUI(false);
      });
  }
}

playPauseBtn.addEventListener('click', () => {
  if (audio.paused){
    audio.play().then(() => setPlayingUI(true)).catch(() => {});
  } else {
    audio.pause();
    setPlayingUI(false);
  }
});

function setPlayingUI(isPlaying){
  iconPlay.classList.toggle('hidden', isPlaying);
  iconPause.classList.toggle('hidden', !isPlaying);
}

audio.addEventListener('timeupdate', () => {
  if (audio.duration){
    progressBar.value = (audio.currentTime / audio.duration) * 100;
    timeCurrent.textContent = formatTime(audio.currentTime);
  }
});

audio.addEventListener('loadedmetadata', () => {
  timeTotal.textContent = formatTime(audio.duration);
});

progressBar.addEventListener('input', () => {
  if (audio.duration){
    audio.currentTime = (progressBar.value / 100) * audio.duration;
  }
});

volumeBar.addEventListener('input', () => {
  audio.volume = parseFloat(volumeBar.value);
});

function formatTime(seconds){
  if (!isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
