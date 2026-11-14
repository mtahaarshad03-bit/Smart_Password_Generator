// Smart Password Generator — secure generation with Web Crypto API
"use strict";

const elements = {
  output: document.getElementById("passwordOutput"),
  slider: document.getElementById("lengthSlider"),
  lengthValue: document.getElementById("lengthValue"),
  uppercase: document.getElementById("uppercase"),
  lowercase: document.getElementById("lowercase"),
  numbers: document.getElementById("numbers"),
  symbols: document.getElementById("symbols"),
  generate: document.getElementById("generateButton"),
  copy: document.getElementById("copyButton"),
  visibility: document.getElementById("toggleVisibility"),
  eyeIcon: document.getElementById("eyeIcon"),
  strengthBar: document.getElementById("strengthBar"),
  strengthText: document.getElementById("strengthText"),
  validation: document.getElementById("validationMessage"),
  toast: document.getElementById("toast")
};

const CHARACTER_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
};

let toastTimer;
let passwordVisible = true;

function selectedSets() {
  return [
    elements.uppercase.checked ? CHARACTER_SETS.uppercase : "",
    elements.lowercase.checked ? CHARACTER_SETS.lowercase : "",
    elements.numbers.checked ? CHARACTER_SETS.numbers : "",
    elements.symbols.checked ? CHARACTER_SETS.symbols : ""
  ].filter(Boolean);
}

// Rejection sampling avoids modulo bias when choosing a character.
function secureRandomInt(max) {
  if (!Number.isInteger(max) || max < 1 || max > 256) {
    throw new Error("Invalid random range.");
  }
  if (!window.crypto || typeof window.crypto.getRandomValues !== "function") {
    throw new Error("Secure random generation is not supported in this browser.");
  }
  const limit = Math.floor(256 / max) * max;
  const randomValues = new Uint8Array(1);
  let value;
  do {
    window.crypto.getRandomValues(randomValues);
    value = randomValues[0];
  } while (value >= limit);
  return value % max;
}

function secureShuffle(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = secureRandomInt(i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function updateSlider() {
  const min = Number(elements.slider.min);
  const max = Number(elements.slider.max);
  const value = Number(elements.slider.value);
  const percent = ((value - min) / (max - min)) * 100;
  elements.lengthValue.value = value;
  elements.lengthValue.textContent = value;
  elements.slider.style.background = `linear-gradient(to right, var(--accent) ${percent}%, #344139 ${percent}%)`;
}

function showToast(message, isError = false) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.toggle("error", isError);
  elements.toast.classList.add("show");
  toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2600);
}

function calculateStrength(length, setCount) {
  // This is a useful visual estimate, not a formal security audit.
  const score = Math.min(4, Math.floor((length / 12) + (setCount - 1) * 0.8));
  const levels = [
    { label: "Very weak", width: "15%", color: "#ff7777" },
    { label: "Weak", width: "30%", color: "#ff9b65" },
    { label: "Fair", width: "50%", color: "#f0c66a" },
    { label: "Strong", width: "75%", color: "#a9dc70" },
    { label: "Very strong", width: "100%", color: "#b7f36b" }
  ];
  const level = levels[score];
  elements.strengthBar.style.width = level.width;
  elements.strengthBar.style.background = level.color;
  elements.strengthText.textContent = level.label;
  elements.strengthText.style.color = level.color;
}

function generatePassword() {
  const sets = selectedSets();
  const length = Number(elements.slider.value);

  if (sets.length === 0) {
    elements.validation.textContent = "Select at least one character type to continue.";
    elements.output.value = "";
    elements.strengthBar.style.width = "0";
    elements.strengthText.textContent = "Choose character types";
    return;
  }
  if (length < sets.length) {
    elements.validation.textContent = `Choose a length of at least ${sets.length} to include every selected type.`;
    return;
  }
  elements.validation.textContent = "";

  try {
    // Guarantee at least one character from every selected set.
    const characters = sets.map(set => set[secureRandomInt(set.length)]);
    const allCharacters = sets.join("");
    while (characters.length < length) {
      characters.push(allCharacters[secureRandomInt(allCharacters.length)]);
    }
    const password = secureShuffle(characters).join("");
    elements.output.value = password;
    passwordVisible = true;
    elements.output.type = "text";
    elements.visibility.setAttribute("aria-label", "Hide password");
    calculateStrength(length, sets.length);
    showToast("A secure password has been generated.");
  } catch (error) {
    elements.validation.textContent = error.message;
    showToast(error.message, true);
  }
}

async function copyPassword() {
  const password = elements.output.value;
  if (!password) {
    showToast("Generate a password before copying.", true);
    return;
  }
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(password);
    } else {
      // Fallback for local development on browsers without Clipboard API access.
      const temporary = document.createElement("textarea");
      temporary.value = password;
      temporary.setAttribute("readonly", "");
      temporary.style.position = "fixed";
      temporary.style.opacity = "0";
      document.body.appendChild(temporary);
      temporary.select();
      const copied = document.execCommand("copy");
      temporary.remove();
      if (!copied) throw new Error("Clipboard access was denied.");
    }
    showToast("Password copied to clipboard!");
  } catch (error) {
    showToast("Could not copy automatically. Please select and copy it.", true);
  }
}

function toggleVisibility() {
  passwordVisible = !passwordVisible;
  elements.output.type = passwordVisible ? "text" : "password";
  elements.visibility.setAttribute("aria-label", passwordVisible ? "Hide password" : "Show password");
  elements.eyeIcon.innerHTML = passwordVisible
    ? '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'
    : '<path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3 3.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10 10 0 0 0 3-.5"/>';
}

elements.slider.addEventListener("input", updateSlider);
elements.generate.addEventListener("click", generatePassword);
elements.copy.addEventListener("click", copyPassword);
elements.visibility.addEventListener("click", toggleVisibility);

// Clear the validation message as soon as the user makes a valid selection.
[ elements.uppercase, elements.lowercase, elements.numbers, elements.symbols ].forEach(input => {
  input.addEventListener("change", () => {
    if (selectedSets().length > 0) elements.validation.textContent = "";
  });
});

updateSlider();
generatePassword();
