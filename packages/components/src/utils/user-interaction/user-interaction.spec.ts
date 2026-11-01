import { beforeEach, describe, expect, it, vi } from 'vitest';

/* The module keeps page-wide state, so every test loads a fresh copy. */
const load = () => import('./user-interaction');

describe('user-interaction', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('starts without interaction', async () => {
    const { hasUserInteracted } = await load();
    expect(hasUserInteracted()).toBe(false);
  });

  it('runs the waiting callbacks on the first click, once', async () => {
    const { hasUserInteracted, onUserInteraction } = await load();
    const callback = vi.fn();
    onUserInteraction(callback);
    expect(callback).not.toHaveBeenCalled();

    document.dispatchEvent(new MouseEvent('click'));
    document.dispatchEvent(new MouseEvent('click'));

    expect(callback).toHaveBeenCalledTimes(1);
    expect(hasUserInteracted()).toBe(true);
  });

  it('counts a key press as interaction too', async () => {
    const { hasUserInteracted, setupInteractionListener } = await load();
    setupInteractionListener();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(hasUserInteracted()).toBe(true);
  });

  it('runs the callback right away after the interaction', async () => {
    const { onUserInteraction, setupInteractionListener } = await load();
    setupInteractionListener();
    document.dispatchEvent(new MouseEvent('click'));
    const callback = vi.fn();
    onUserInteraction(callback);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('keeps running the other callbacks when one throws', async () => {
    const { onUserInteraction } = await load();
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const after = vi.fn();
    onUserInteraction(() => {
      throw new Error('boom');
    });
    onUserInteraction(after);

    document.dispatchEvent(new MouseEvent('click'));

    expect(after).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
