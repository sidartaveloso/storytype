/*
 * The person's first interaction with the page.
 *
 * Browsers block audio and vibration until a click, touch or key press. In a
 * tray app (Tauri, Electron) autoplay is usually allowed; in a browser, the
 * alarm waits for this first interaction to resume the sound.
 *
 * Where the browser tracks it (`navigator.userActivation`), the browser is the
 * authority: a synthetic event (a test, a story's play function) is not a
 * gesture to it, and audio and vibration stay blocked.
 */

let interacted = false;
const callbacks: Array<() => void> = [];

const INTERACTION_EVENTS = ['click', 'touchstart', 'keydown'] as const;

/** Whether the browser has seen a real gesture; undefined where it does not say (jsdom, older browsers). */
function browserActivation(): boolean | undefined {
  return globalThis.navigator?.userActivation?.hasBeenActive;
}

function onFirstInteraction(): void {
  if (interacted || browserActivation() === false) return;
  interacted = true;
  for (const callback of callbacks.splice(0)) {
    try {
      callback();
    } catch (error) {
      console.error('[user-interaction] a callback failed:', error);
    }
  }
  for (const event of INTERACTION_EVENTS) {
    document.removeEventListener(event, onFirstInteraction, true);
  }
}

/** Listens for the first interaction. Safe to call more than once. */
export function setupInteractionListener(): void {
  if (hasUserInteracted() || typeof document === 'undefined') return;
  for (const event of INTERACTION_EVENTS) {
    document.addEventListener(event, onFirstInteraction, { capture: true });
  }
}

/** Whether the person has already interacted with the page. */
export function hasUserInteracted(): boolean {
  return browserActivation() ?? interacted;
}

/** Runs the callback on the first interaction, or right away if it happened. */
export function onUserInteraction(callback: () => void): void {
  if (hasUserInteracted()) callback();
  else {
    callbacks.push(callback);
    setupInteractionListener();
  }
}
