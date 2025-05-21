import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { toastStore, toast, type ToastItem } from '../stores/toast'; // Adjust path as necessary

describe('toastStore and toast utility', () => {
  beforeEach(() => {
    // Reset the store's internal state before each test
    vi.useFakeTimers(); // Use fake timers for controlling setTimeout
    vi.clearAllTimers(); // Clear any timers from previous tests

    // Correctly reset the toast store's state
    let currentToasts: ToastItem[] = [];
    const unsub = toastStore.subscribe(value => {
      currentToasts = value;
    });
    currentToasts.forEach(toast => toastStore.removeToast(toast.id));
    unsub();
    // Ensure all removal timers (if any from removeToast) are also cleared immediately
    vi.runOnlyPendingTimers(); 
  });

  afterEach(() => {
    vi.clearAllMocks(); // Clear any spies
    vi.clearAllTimers(); // Ensure all timers are cleared
    vi.useRealTimers(); // Restore real timers
  });

  describe('toastStore.addToast()', () => {
    it('should add a new toast object to the store', () => {
      toastStore.addToast({ type: 'success', message: 'Test success!' });
      let currentToasts: ToastItem[] = [];
      const unsubscribe = toastStore.subscribe(value => {
        currentToasts = value;
      });
      expect(currentToasts.length).toBe(1);
      expect(currentToasts[0].type).toBe('success');
      expect(currentToasts[0].message).toBe('Test success!');
      expect(currentToasts[0].id).toBeDefined();
      unsubscribe();
    });

    it('should assign a unique id to each toast', () => {
      toastStore.addToast({ message: 'Toast 1' });
      toastStore.addToast({ message: 'Toast 2' });
      let currentToasts: ToastItem[] = [];
      const unsubscribe = toastStore.subscribe(value => currentToasts = value);
      expect(currentToasts.length).toBe(2);
      expect(currentToasts[0].id).not.toBe(currentToasts[1].id);
      unsubscribe();
    });

    it('should call setTimeout to schedule removal if duration is provided', () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      toastStore.addToast({ message: 'Timed Toast', duration: 3000 });
      expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 3000);
      // No need to restore spy if it's cleared in afterEach
    });

    it('should remove the toast from the store after the specified duration', () => {
      toastStore.addToast({ message: 'Auto-remove Toast', duration: 2000 });
      let currentToasts: ToastItem[] = [];
      const unsubscribe = toastStore.subscribe(value => currentToasts = value);
      
      expect(currentToasts.length).toBe(1);
      
      vi.advanceTimersByTime(1999);
      expect(currentToasts.length).toBe(1); // Still there
      
      vi.advanceTimersByTime(1);
      expect(currentToasts.length).toBe(0); // Should be removed
      unsubscribe();
    });

    it('should not call setTimeout if no duration is provided (toast persists)', () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      toastStore.addToast({ message: 'Persistent Toast' }); // Duration is undefined
      expect(setTimeoutSpy).not.toHaveBeenCalled();
      
      let currentToasts: ToastItem[] = [];
      const unsubscribe = toastStore.subscribe(value => currentToasts = value);
      expect(currentToasts.length).toBe(1);
      
      vi.advanceTimersByTime(5000); // Advance time well beyond typical durations
      expect(currentToasts.length).toBe(1); // Should still be there
      unsubscribe();
      // No need to restore spy
    });
  });

  describe('toastStore.removeToast()', () => {
    it('should remove a toast by its id', () => {
      toastStore.addToast({ message: 'Toast to remove' });
      let currentToasts: ToastItem[] = [];
      const unsubscribe = toastStore.subscribe(value => currentToasts = value);
      
      const toastIdToRemove = currentToasts[0].id;
      toastStore.removeToast(toastIdToRemove);
      expect(currentToasts.length).toBe(0);
      unsubscribe();
    });

    it('should do nothing if an id that does not exist is provided', () => {
      toastStore.addToast({ message: 'Existing Toast' });
      let currentToasts: ToastItem[] = [];
      const unsubscribe = toastStore.subscribe(value => currentToasts = value);
      
      toastStore.removeToast('non-existent-id');
      expect(currentToasts.length).toBe(1); // Should remain unchanged
      unsubscribe();
    });

     it('should clear the timeout if a toast is removed manually before its duration expires', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      toastStore.addToast({ message: 'Timed Toast to remove manually', duration: 5000 });
      
      let currentToasts: ToastItem[] = [];
      // Subscribe to get the toast ID
      const unsub = toastStore.subscribe(value => { currentToasts = value; });
      const toastId = currentToasts[0].id;
      unsub(); // Unsubscribe early to avoid issues with async removal during test execution

      toastStore.removeToast(toastId);
      expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
      
      // Re-subscribe to check final state if needed, or check timers
      let finalToasts: ToastItem[] = [];
      const unsubFinal = toastStore.subscribe(value => { finalToasts = value; });

      vi.advanceTimersByTime(5000); // Advance time to ensure original timeout would have fired
      expect(finalToasts.length).toBe(0); // Already removed, should stay removed
      
      unsubFinal();
      // No need to restore spy
    });
  });

  describe('toastStore.subscribe()', () => {
    it('should notify subscribers when a toast is added', (done) => {
      const unsubscribe = toastStore.subscribe(toasts => {
        if (toasts.length > 0) {
          expect(toasts.length).toBe(1);
          expect(toasts[0].message).toBe('Notify on Add');
          unsubscribe();
          done();
        }
      });
      toastStore.addToast({ message: 'Notify on Add' });
    });

    it('should notify subscribers when a toast is removed', (done) => {
      toastStore.addToast({ message: 'Notify on Remove', duration: 100 }); // Add one that will be removed
      
      let callCount = 0;
      const unsubscribe = toastStore.subscribe(toasts => {
        callCount++;
        if (callCount === 1) { // Initial add
          expect(toasts.length).toBe(1);
        } else if (callCount === 2) { // After removal
          expect(toasts.length).toBe(0);
          unsubscribe();
          done();
        }
      });
      vi.advanceTimersByTime(100); // Trigger removal
    });
  });

  describe('toast() utility function', () => {
    it('should call toastStore.addToast with the provided message, type, and duration', () => {
      // We are testing the `toast` utility function which internally calls `toastStore.addToast`
      // So, we should spy on `toastStore.addToast` to verify its arguments.
      const storeAddToastSpy = vi.spyOn(toastStore, 'addToast');
      toast('Test Message', 'error', 5000);
      
      expect(storeAddToastSpy).toHaveBeenCalledTimes(1);
      expect(storeAddToastSpy).toHaveBeenCalledWith({
        message: 'Test Message',
        type: 'error',
        duration: 5000,
      });
      // No need to restore spy
    });

    it('should use default type "info" if type is not provided', () => {
      const storeAddToastSpy = vi.spyOn(toastStore, 'addToast');
      toast('Info Message'); // type and duration are default
      
      expect(storeAddToastSpy).toHaveBeenCalledTimes(1);
      expect(storeAddToastSpy).toHaveBeenCalledWith({ // Check the object passed to the store's method
        message: 'Info Message',
        type: 'info', // Default type
        duration: 3000, // Default duration from toast function
      });
      // No need to restore spy
    });

    it('should use default duration (e.g., 3000ms or as defined in store) if duration is not provided', () => {
      const storeAddToastSpy = vi.spyOn(toastStore, 'addToast');
      const globalSetTimeoutSpy = vi.spyOn(global, 'setTimeout');
      
      toast('Default Duration Message'); // Uses default duration from `toast` function
      
      expect(storeAddToastSpy).toHaveBeenCalledTimes(1);
      const callArg = storeAddToastSpy.mock.calls[0][0];
      expect(callArg.message).toBe('Default Duration Message');
      expect(callArg.type).toBe('info'); // Default type
      expect(callArg.duration).toBe(3000); // Default duration from toast function
      
      // setTimeout should be called by toastStore.addToast with this duration
      expect(globalSetTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 3000);
      
      // No need to restore spies
    });

    it('should correctly pass undefined duration if explicitly passed as undefined to toast()', () => {
      const storeAddToastSpy = vi.spyOn(toastStore, 'addToast');
      const globalSetTimeoutSpy = vi.spyOn(global, 'setTimeout');

      toast('Explicit Undefined Duration', 'warning', undefined);

      expect(storeAddToastSpy).toHaveBeenCalledTimes(1);
      expect(storeAddToastSpy).toHaveBeenCalledWith({
        message: 'Explicit Undefined Duration',
        type: 'warning',
        duration: undefined, // Explicitly undefined
      });
      // setTimeout should not be called by addToast if duration is undefined
      expect(globalSetTimeoutSpy).not.toHaveBeenCalled();
      
      // No need to restore spies
    });
  });
});
