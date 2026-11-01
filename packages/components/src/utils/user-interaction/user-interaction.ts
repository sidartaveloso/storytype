/*
 * The person's first interaction with the page.
 *
 * Browsers block audio and vibration until a click, touch or key press. In a
 * tray app (Tauri, Electron) autoplay is usually allowed; in a browser, the
 * alarm waits for this first interaction to resume the sound.
 */

let interacted = false;
const callbacks: Array<() => void> = [];

const INTERACTION_EVENTS = ['click', 'touchstart', 'keydown'] as const;

function onFirstInteraction(): void {
  if (interacted) return;
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
  if (interacted || typeof document === 'undefined') return;
  for (const event of INTERACTION_EVENTS) {
    document.addEventListener(event, onFirstInteraction, { capture: true });
  }
}

/** Whether the person has already interacted with the page. */
export function hasUserInteracted(): boolean {
  return interacted;
}

/** Runs the callback on the first interaction, or right away if it happened. */
export function onUserInteraction(callback: () => void): void {
  if (interacted) callback();
  else {
    callbacks.push(callback);
    setupInteractionListener();
  }
}
