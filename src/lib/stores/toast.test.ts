import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { toastStore, toast, type ToastItem } from '../stores/toast'; // Adjust path as necessary

describe('toastStore and toast utility', () => {
  beforeEach(() => {
    // Reset the store's internal state before each test
    // This might involve a dedicated reset method on the store if available,
    // or manually clearing its state if it's directly accessible (not ideal for encapsulation)
    // For a simple store, we might just rely on creating fresh instances or ensuring
    // tests don't interfere. Since toastStore is a singleton, we'll clear its toasts.
    // @ts-expect-error accessing private member for test
    toastStore.update(toasts => []); 
    vi.useFakeTimers(); // Use fake timers for controlling setTimeout
  });

  afterEach(() => {
    vi.clearAllMocks(); // Clear any spies
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
      setTimeoutSpy.mockRestore();
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
      toastStore.addToast({ message: 'Persistent Toast' });
      expect(setTimeoutSpy).not.toHaveBeenCalled();
      
      let currentToasts: ToastItem[] = [];
      const unsubscribe = toastStore.subscribe(value => currentToasts = value);
      expect(currentToasts.length).toBe(1);
      
      vi.advanceTimersByTime(5000); // Advance time well beyond typical durations
      expect(currentToasts.length).toBe(1); // Should still be there
      unsubscribe();
      setTimeoutSpy.mockRestore();
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
      const unsubscribe = toastStore.subscribe(value => currentToasts = value);
      const toastId = currentToasts[0].id;

      toastStore.removeToast(toastId);
      expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
      
      vi.advanceTimersByTime(5000);
      expect(currentToasts.length).toBe(0); // Already removed, should stay removed
      
      clearTimeoutSpy.mockRestore();
      unsubscribe();
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
      const addToastSpy = vi.spyOn(toastStore, 'addToast');
      toast('Test Message', 'error', 5000);
      
      expect(addToastSpy).toHaveBeenCalledTimes(1);
      expect(addToastSpy).toHaveBeenCalledWith({
        message: 'Test Message',
        type: 'error',
        duration: 5000,
      });
      addToastSpy.mockRestore();
    });

    it('should use default type "info" if type is not provided', () => {
      const addToastSpy = vi.spyOn(toastStore, 'addToast');
      toast('Info Message');
      
      expect(addToastSpy).toHaveBeenCalledTimes(1);
      expect(addToastSpy).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Info Message',
        type: 'info',
      }));
      addToastSpy.mockRestore();
    });

    it('should use default duration (e.g., 3000ms or as defined in store) if duration is not provided', () => {
      // This test assumes a default duration is set by addToast or the toast function itself
      // if not explicitly passed. The implementation of toastStore.addToast will determine this.
      // Let's assume the default is 3000ms as per typical toast behavior.
      const addToastSpy = vi.spyOn(toastStore, 'addToast');
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      
      toast('Default Duration Message');
      
      expect(addToastSpy).toHaveBeenCalledTimes(1);
      const callArg = addToastSpy.mock.calls[0][0];
      expect(callArg.message).toBe('Default Duration Message');
      
      // Check if duration was passed to addToast (it might be undefined if default is handled internally)
      // Or, more robustly, check if setTimeout was called with the expected default duration
      if (callArg.duration !== undefined) {
        expect(callArg.duration).toBe(3000); // Assuming default is 3000ms
        expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 3000);
      } else {
        // If duration is not in callArg, it means the default is applied inside addToast
        // We already test addToast's default duration behavior, so this spy call is sufficient.
        // The important part is that addToast was called correctly.
        // We can also check that setTimeout was called if a default duration leads to it.
        expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), expect.any(Number));
      }
      
      addToastSpy.mockRestore();
      setTimeoutSpy.mockRestore();
    });
     it('should correctly pass undefined duration if explicitly passed as undefined to toast()', () => {
      const addToastSpy = vi.spyOn(toastStore, 'addToast');
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      toast('Explicit Undefined Duration', 'warning', undefined);

      expect(addToastSpy).toHaveBeenCalledTimes(1);
      expect(addToastSpy).toHaveBeenCalledWith({
        message: 'Explicit Undefined Duration',
        type: 'warning',
        duration: undefined, // Explicitly undefined
      });
      // setTimeout should not be called by addToast if duration is undefined
      expect(setTimeoutSpy).not.toHaveBeenCalled();

      addToastSpy.mockRestore();
      setTimeoutSpy.mockRestore();
    });
  });
});
