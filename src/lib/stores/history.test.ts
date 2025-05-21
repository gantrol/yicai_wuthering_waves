import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EditHistory } from '../stores/history';

// Helper function to create a simple grid for testing
const createGrid = (id: number): number[][] => [[id]];

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

describe('EditHistory', () => {
  const routeId = 'test-route';
  let history: EditHistory;

  beforeEach(() => {
    // Assign the mock to global localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    history = new EditHistory(routeId, 3); // maxRecords = 3 for easier testing
    localStorageMock.clear(); // Clear mock storage before each test
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restore any spies or mocks
    localStorageMock.clear(); // Ensure clean state for next test suite if any
  });

  describe('constructor and loadFromStorage', () => {
    it('should initialize with an initial grid if provided', () => {
      const initialGrid = createGrid(0);
      const h = new EditHistory(routeId, 3, initialGrid);
      expect(h.getCurrentState()).toEqual(initialGrid);
      expect(h.getCurrentState()).not.toBe(initialGrid); // Check deep copy
    });

    it('should call loadFromStorage on construction', () => {
      const loadSpy = vi.spyOn(EditHistory.prototype, 'loadFromStorage');
      new EditHistory(routeId, 3);
      expect(loadSpy).toHaveBeenCalledTimes(1);
      loadSpy.mockRestore();
    });

    it('should load records and currentIndex from localStorage if they exist', () => {
      const recordsToStore = [createGrid(1), createGrid(2)];
      const currentIndexToStore = 1;
      localStorageMock.setItem(`editHistory-${routeId}`, JSON.stringify({ records: recordsToStore, currentIndex: currentIndexToStore }));
      
      const h = new EditHistory(routeId, 3);
      expect(h.getCurrentState()).toEqual(recordsToStore[currentIndexToStore]);
      // @ts-expect-error accessing private member for test
      expect(h.records).toEqual(recordsToStore);
      // @ts-expect-error accessing private member for test
      expect(h.currentIndex).toBe(currentIndexToStore);
    });

    it('should handle invalid JSON in localStorage gracefully', () => {
      localStorageMock.setItem(`editHistory-${routeId}`, 'invalid json');
      const initialGrid = createGrid(0);
      const h = new EditHistory(routeId, 3, initialGrid);
      expect(h.getCurrentState()).toEqual(initialGrid); // Should use initial state
    });
  });

  describe('addRecord', () => {
    it('should add a new grid state to the history', () => {
      const grid1 = createGrid(1);
      history.addRecord(grid1);
      expect(history.getCurrentState()).toEqual(grid1);
    });

    it('should ensure deep copying of the grid', () => {
      const grid1 = createGrid(1);
      history.addRecord(grid1);
      grid1[0][0] = 99; // Modify original grid
      expect(history.getCurrentState()).toEqual(createGrid(1)); // Stored record should be unaffected
    });

    it('should discard records after currentIndex when adding a new one (after undo)', () => {
      const grid1 = createGrid(1);
      const grid2 = createGrid(2);
      const grid3 = createGrid(3);

      history.addRecord(grid1);
      history.addRecord(grid2);
      history.undo(); // currentIndex is now at grid1
      
      history.addRecord(grid3); // Should replace grid2
      expect(history.getCurrentState()).toEqual(grid3);
      // @ts-expect-error accessing private member for test
      expect(history.records.length).toBe(2); 
      // @ts-expect-error accessing private member for test
      expect(history.records[1]).toEqual(grid3);
    });

    it('should respect maxRecords: oldest record removed if limit exceeded', () => {
      const grid1 = createGrid(1);
      const grid2 = createGrid(2);
      const grid3 = createGrid(3);
      const grid4 = createGrid(4);

      history.addRecord(grid1);
      history.addRecord(grid2);
      history.addRecord(grid3);
      history.addRecord(grid4); // Exceeds maxRecords = 3

      // @ts-expect-error accessing private member for test
      expect(history.records.length).toBe(3);
      // @ts-expect-error accessing private member for test
      expect(history.records[0]).toEqual(grid2); // grid1 should be removed
      expect(history.getCurrentState()).toEqual(grid4);
    });
    
    it('should correctly adjust currentIndex when maxRecords is exceeded and current index was 0', () => {
      const h = new EditHistory(routeId, 2); // maxRecords = 2
      const grid1 = createGrid(1);
      const grid2 = createGrid(2);
      const grid3 = createGrid(3);

      h.addRecord(grid1); // records: [g1], currentIndex: 0
      h.addRecord(grid2); // records: [g1, g2], currentIndex: 1
      h.addRecord(grid3); // records: [g2, g3], currentIndex: 1 (g1 removed, currentIndex shifted from 0 to -1 then set to 1)
      
      // @ts-expect-error accessing private member for test
      expect(h.records.length).toBe(2);
      // @ts-expect-error accessing private member for test
      expect(h.records[0]).toEqual(grid2);
      // @ts-expect-error accessing private member for test
      expect(h.records[1]).toEqual(grid3);
      // @ts-expect-error accessing private member for test
      expect(h.currentIndex).toBe(1);
      expect(h.getCurrentState()).toEqual(grid3);

      const undone = h.undo();
      expect(undone).toEqual(grid2);
      // @ts-expect-error accessing private member for test
      expect(h.currentIndex).toBe(0);
    });


    it('should call saveToStorage after adding a record', () => {
      const saveSpy = vi.spyOn(history, 'saveToStorage');
      history.addRecord(createGrid(1));
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('undo', () => {
    it('should return the previously recorded grid state and update currentIndex', () => {
      const grid1 = createGrid(1);
      const grid2 = createGrid(2);
      history.addRecord(grid1);
      history.addRecord(grid2);

      const undoneState = history.undo();
      expect(undoneState).toEqual(grid1);
      // @ts-expect-error accessing private member for test
      expect(history.currentIndex).toBe(0);
      expect(history.getCurrentState()).toEqual(grid1);
    });

    it('should return null if there are no more states to undo', () => {
      history.addRecord(createGrid(1));
      history.undo(); // Back to initial (or before first) state
      expect(history.undo()).toBeNull();
      // @ts-expect-error accessing private member for test
      expect(history.currentIndex).toBe(-1); // Or 0 if initial state is always present
    });
    
    it('should return null if history is empty', () => {
      const h = new EditHistory(routeId, 3); // No initial grid
      expect(h.undo()).toBeNull();
    });

    it('should ensure the returned grid is a deep copy', () => {
      const grid1 = createGrid(1);
      const grid2 = createGrid(2);
      history.addRecord(grid1);
      history.addRecord(grid2);

      const undoneState = history.undo();
      expect(undoneState).toEqual(grid1);
      if (undoneState) {
        undoneState[0][0] = 99; // Modify returned state
      }
      // @ts-expect-error accessing private member for test
      expect(history.records[0]).toEqual(createGrid(1)); // Stored record should be unaffected
      expect(history.getCurrentState()).toEqual(createGrid(1));
    });

    it('should call saveToStorage after undoing', () => {
      history.addRecord(createGrid(1));
      history.addRecord(createGrid(2));
      const saveSpy = vi.spyOn(history, 'saveToStorage');
      history.undo();
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('redo', () => {
    it('should return the next (undone) grid state and update currentIndex', () => {
      const grid1 = createGrid(1);
      const grid2 = createGrid(2);
      history.addRecord(grid1);
      history.addRecord(grid2);
      history.undo(); // currentIndex is now at grid1

      const redoneState = history.redo();
      expect(redoneState).toEqual(grid2);
      // @ts-expect-error accessing private member for test
      expect(history.currentIndex).toBe(1);
      expect(history.getCurrentState()).toEqual(grid2);
    });

    it('should return null if there are no more states to redo', () => {
      history.addRecord(createGrid(1));
      history.addRecord(createGrid(2));
      history.undo();
      history.redo(); // Back to grid2, latest state
      expect(history.redo()).toBeNull();
      // @ts-expect-error accessing private member for test
      expect(history.currentIndex).toBe(1);
    });
    
    it('should return null if history is empty or no undos were made', () => {
      const h = new EditHistory(routeId, 3);
      expect(h.redo()).toBeNull();
      h.addRecord(createGrid(1));
      expect(h.redo()).toBeNull();
    });

    it('should ensure the returned grid is a deep copy', () => {
      const grid1 = createGrid(1);
      const grid2 = createGrid(2);
      history.addRecord(grid1);
      history.addRecord(grid2);
      history.undo();

      const redoneState = history.redo();
      expect(redoneState).toEqual(grid2);
      if (redoneState) {
        redoneState[0][0] = 99; // Modify returned state
      }
      // @ts-expect-error accessing private member for test
      expect(history.records[1]).toEqual(createGrid(2)); // Stored record should be unaffected
      expect(history.getCurrentState()).toEqual(createGrid(2));
    });

    it('should call saveToStorage after redoing', () => {
      history.addRecord(createGrid(1));
      history.addRecord(createGrid(2));
      history.undo();
      const saveSpy = vi.spyOn(history, 'saveToStorage');
      history.redo();
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCurrentState', () => {
    it('should return the current grid state based on currentIndex', () => {
      const grid1 = createGrid(1);
      const grid2 = createGrid(2);
      history.addRecord(grid1);
      history.addRecord(grid2);
      expect(history.getCurrentState()).toEqual(grid2);
      history.undo();
      expect(history.getCurrentState()).toEqual(grid1);
    });

    it('should return null if the history is empty and no initial grid', () => {
      const h = new EditHistory(routeId, 3); // No initial grid
      expect(h.getCurrentState()).toBeNull();
    });
    
    it('should return initial grid if history is "empty" but was initialized with one', () => {
      const initialGrid = createGrid(0);
      const h = new EditHistory(routeId, 3, initialGrid);
      expect(h.getCurrentState()).toEqual(initialGrid);
      h.undo(); // Try to go before initial state
      expect(h.getCurrentState()).toEqual(initialGrid); // Should still be initial or null depending on strict definition
    });

    it('should ensure the returned grid is a deep copy', () => {
      const grid1 = createGrid(1);
      history.addRecord(grid1);
      const currentState = history.getCurrentState();
      expect(currentState).toEqual(grid1);
      if (currentState) {
        currentState[0][0] = 99; // Modify returned state
      }
      // @ts-expect-error accessing private member for test
      expect(history.records[0]).toEqual(createGrid(1)); // Stored record should be unaffected
    });
  });

  describe('saveToStorage', () => {
    it('should correctly stringify and save records and currentIndex', () => {
      const grid1 = createGrid(1);
      const grid2 = createGrid(2);
      history.addRecord(grid1);
      history.addRecord(grid2); // currentIndex = 1, records = [g1, g2]

      history.saveToStorage(); // Explicit call for testing, though addRecord also calls it

      const storedData = localStorageMock.getItem(`editHistory-${routeId}`);
      expect(storedData).not.toBeNull();
      const parsedData = JSON.parse(storedData!);
      // @ts-expect-error accessing private member for test
      expect(parsedData.records).toEqual(history.records);
      // @ts-expect-error accessing private member for test
      expect(parsedData.currentIndex).toEqual(history.currentIndex);
    });

    it('should save an empty records array and -1 index if history is empty', () => {
        const h = new EditHistory(routeId, 3); // No initial grid, empty history
        h.saveToStorage();
        const storedData = localStorageMock.getItem(`editHistory-${routeId}`);
        expect(storedData).not.toBeNull();
        const parsedData = JSON.parse(storedData!);
        expect(parsedData.records).toEqual([]);
        expect(parsedData.currentIndex).toEqual(-1);
    });
  });
});
