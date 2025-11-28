// ===========================
// CONFIGURACIÓN PRINCIPAL
// ===========================

// Cambia aquí fácilmente la contraseña (fecha) que quieras usar.
const SECRET_CODE = "30102025"; // Ej: 24/07/2023 -> "24072023"

let currentCode = "";

// Referencias DOM para la pantalla de bloqueo
const lockScreen = document.getElementById("lockScreen");
const envelopeScreen = document.getElementById("envelopeScreen");

const codeDisplay = document.getElementById("codeDisplay");
const keypadButtons = document.querySelectorAll(".keypad-key[data-key]");
const deleteButton = document.getElementById("deleteButton");
const hintButton = document.getElementById("hintButton");
const hintText = document.getElementById("hintText");
const lockError = document.getElementById("lockError");
const lockInfo = document.getElementById("lockInfo");

// Referencias DOM para la parte del sobre y la carta
const envelope = document.getElementById("envelope");
const letterPreview = document.getElementById("letterPreview");
const fullLetter = document.getElementById("fullLetter");
const pullMessage = document.getElementById("pullMessage");
const envelopeIntro = document.querySelector(".envelope-intro");

// Música de fondo
const bgMusic = document.getElementById("bg-music");
const musicButton = document.getElementById("musicButton");
let musicStarted = false;

let envelopeOpened = false;
let letterPulled = false;

// Duraciones para coordinar la animación
const LETTER_FRONT_ANIM_DURATION = 500; // debe coincidir con animation de .letterFront (0.5s)
const LETTER_FRONT_PAUSE = 300;        // pausa quieta frente al sobre antes de desvanecerse

// ===========================
// SONIDOS
// ===========================
const soundKey = document.getElementById("sound-key");
const soundEnvelopeOpen = document.getElementById("sound-envelope-open");
const soundLetterPull = document.getElementById("sound-letter-pull");

function playSound(audioEl) {
  if (!audioEl) return;
  try {
    audioEl.currentTime = 0;
    audioEl.play();
  } catch (e) {
    // Por si el navegador bloquea el autoplay, no pasa nada
    console.log("No se pudo reproducir un efecto de sonido:", e);
  }
}

// ===========================
// MÚSICA DE FONDO
// ===========================
function startBackgroundMusic() {
  if (musicStarted || !bgMusic) return;
  musicStarted = true;

  console.log("Intentando iniciar música de fondo...");

  // Sube esto si quieres probar más fuerte (0.4 es moderado)
  bgMusic.volume = 0;

  bgMusic.play().then(() => {
    console.log("Música de fondo reproduciéndose ✅");
    // Fade-in suavecito
    let vol = 0;
    const fade = setInterval(() => {
      vol += 0.03;
      if (vol >= 0.4) {
        vol = 0.4;
        clearInterval(fade);
      }
      bgMusic.volume = vol;
    }, 150);
  }).catch(err => {
    console.log("Reproducción bloqueada o error al reproducir música:", err);
  });

  // Ocultar el botón una vez activada la música
  if (musicButton) {
    musicButton.classList.add("hidden");
  }
}

// ===========================
// FUNCIONES DE UTILIDAD
// ===========================

/**
 * Construye los circulitos del display según la longitud de la contraseña.
 */
function initCodeDisplay() {
  codeDisplay.innerHTML = "";
  for (let i = 0; i < SECRET_CODE.length; i++) {
    const dot = document.createElement("span");
    dot.classList.add("code-dot");
    codeDisplay.appendChild(dot);
  }
}

/**
 * Actualiza el estado visual de los circulitos según los dígitos escritos.
 */
function updateCodeDisplay() {
  const dots = codeDisplay.querySelectorAll(".code-dot");
  dots.forEach((dot, index) => {
    if (index < currentCode.length) {
      dot.classList.add("filled");
    } else {
      dot.classList.remove("filled");
    }
  });
}

/**
 * Limpia mensajes y animaciones de error.
 */
function clearMessages() {
  lockError.classList.add("hidden");
  lockInfo.classList.remove("hidden");
  const card = lockCardElement();
  if (card) card.classList.remove("shake");
}

/**
 * Obtiene la tarjeta de bloqueo (para animar error).
 */
function lockCardElement() {
  return document.querySelector(".lock-card");
}

/**
 * Maneja la introducción de un número desde el pad.
 * @param {string} digit - Dígito presionado.
 */
function handleDigitPress(digit) {
  clearMessages();

  // Sonidito de tecla
  playSound(soundKey);

  // No dejar escribir más de la longitud de la contraseña
  if (currentCode.length >= SECRET_CODE.length) return;

  currentCode += digit;
  updateCodeDisplay();

  // Cuando se completa, se comprueba el código
  if (currentCode.length === SECRET_CODE.length) {
    checkCode();
  }
}

/**
 * Comprueba si el código escrito es correcto.
 */
function checkCode() {
  if (currentCode === SECRET_CODE) {
    // Código correcto: mostrar mensajito romántico y luego pasar al sobre
    lockError.classList.add("hidden");
    lockInfo.classList.remove("hidden");
    lockInfo.textContent = "Sí... ese día empezó todo 💫 Gracias por recordarlo.";

    // Un pequeño momento para leer el mensajito
    setTimeout(() => {
      lockInfo.textContent = "¡Perfecto! Abriendo tu carta... 💌";
    }, 1300);

    // Luego pasamos a la pantalla del sobre
    setTimeout(() => {
      goToEnvelopeScreen();
    }, 2400);
  } else {
    // Código incorrecto
    lockError.classList.remove("hidden");
    lockInfo.classList.add("hidden");

    const card = lockCardElement();
    if (card) {
      card.classList.remove("shake");
      // Forzar un reflow para reiniciar la animación si ya estaba aplicada
      void card.offsetWidth;
      card.classList.add("shake");
    }

    // Reiniciar el código tras un pequeño delay
    setTimeout(() => {
      currentCode = "";
      updateCodeDisplay();
      clearMessages();
    }, 650);
  }
}

/**
 * Cambia de la pantalla de bloqueo a la pantalla del sobre.
 */
function goToEnvelopeScreen() {
  // Animación de salida de la pantalla de bloqueo
  lockScreen.classList.add("screen--leaving");

  // Después de la animación, ocultamos lockScreen y mostramos envelopeScreen
  setTimeout(() => {
    lockScreen.classList.remove("screen--active", "screen--leaving");
    lockScreen.classList.add("screen--hidden");

    envelopeScreen.classList.remove("screen--hidden");
    envelopeScreen.classList.add("screen--active");
  }, 480);
}

/**
 * Maneja el click en el sobre (abrirlo / sacar carta).
 */
function handleEnvelopeClick() {
  if (!envelopeOpened) {
    // Sonido de abrir sobre
    playSound(soundEnvelopeOpen);

    // Primer clic: solo abrir el sobre
    envelopeOpened = true;
    envelope.classList.add("is-open");
    pullMessage.classList.remove("hidden");

    // Subir el texto "Te llegó una carta..."
    if (envelopeIntro) {
      envelopeIntro.classList.add("envelope-intro--up");
    }
  } else if (!letterPulled) {
    // Segundo clic (cuando ya está abierto): sacar la carta
    handleLetterPull();
  }
}

/**
 * Maneja el momento de "sacar" la carta pequeña.
 * La carta:
 *  1) Se anima para quedar frente al sobre (CSS .is-out)
 *  2) Se queda unos ms quieta
 *  3) Se desvanece y aparece la carta grande
 */
function handleLetterPull() {
  if (!envelopeOpened || letterPulled) return;

  letterPulled = true;

  // Sonido de sacar carta
  playSound(soundLetterPull);

  // 1) La carta pequeña sale y se coloca al frente (animación CSS)
  letterPreview.classList.add("is-out");

  // 2) Después de la animación + una pequeña pausa, mostramos la carta grande
  const delay =
    LETTER_FRONT_ANIM_DURATION + LETTER_FRONT_PAUSE; // 500 + 300 = 800ms aprox

  setTimeout(() => {
    // Mostrar carta grande
    fullLetter.classList.remove("hidden");
    // Forzar reflow para que la transición se aplique correctamente
    void fullLetter.offsetWidth;
    fullLetter.classList.add("letter-card--visible");

    // Desvanecer carta pequeña
    letterPreview.style.transition = "opacity 0.6s ease";
    letterPreview.style.opacity = "0";

    // Luego quitarla del flujo para que no bloquee clics
    setTimeout(() => {
      letterPreview.style.display = "none";
    }, 600);
  }, delay);
}

// ===========================
// EVENT LISTENERS
// ===========================

// Inicializar display al cargar
initCodeDisplay();
updateCodeDisplay();

// Click en números del pad
keypadButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const digit = btn.dataset.key;
    if (!digit) return;
    handleDigitPress(digit);
  });
});

// Botón borrar
deleteButton.addEventListener("click", () => {
  if (currentCode.length === 0) return;
  currentCode = currentCode.slice(0, -1);
  updateCodeDisplay();
  clearMessages();
});

// Botón pista
hintButton.addEventListener("click", () => {
  hintText.classList.toggle("hidden");
});

// Abrir sobre / sacar carta (primer y segundo clic)
envelope.addEventListener("click", handleEnvelopeClick);

// Sacar carta también haciendo clic directo en la carta pequeña
letterPreview.addEventListener("click", handleLetterPull);

// Botón de activar música de fondo
if (musicButton) {
  musicButton.addEventListener("click", () => {
    startBackgroundMusic();
  });
}

// Permitir escribir con teclado físico
document.addEventListener("keydown", (event) => {
  if (!lockScreen.classList.contains("screen--active")) return;

  if (event.key >= "0" && event.key <= "9") {
    handleDigitPress(event.key);
  } else if (event.key === "Backspace") {
    currentCode = currentCode.slice(0, -1);
    updateCodeDisplay();
    clearMessages();
  }
});
