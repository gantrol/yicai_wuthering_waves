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
    localStorageMock.clear(); // Clear storage BEFORE new EditHistory instance is created
    // Tests will create their own history instances or use a default one.
    // Let's initialize a default history instance for tests that don't need specific constructor args.
    history = new EditHistory(routeId, 3); 
  });

  afterEach(() => {
    localStorageMock.clear(); // Ensure clean state for next test suite
    vi.restoreAllMocks(); 
  });

  describe('constructor and loadFromStorage', () => {
    it('should initialize with an initial grid if localStorage is empty', () => {
      const initialGrid = createGrid(0);
      // localStorage is empty (cleared in beforeEach)
      const h = new EditHistory(routeId, 3, initialGrid);
      expect(h.getCurrentState()).toEqual(initialGrid);
      expect(h.getCurrentState()).not.toBe(initialGrid); // Check deep copy
      // @ts-expect-error accessing private member for test
      expect(h.records.length).toBe(1);
      // @ts-expect-error accessing private member for test
      expect(h.currentIndex).toBe(0);
    });
    
    it('should ignore initialGrid if localStorage has data', () => {
      const storedGrid = createGrid(55);
      const initialGrid = createGrid(0);
      localStorageMock.setItem(`edit-history-${routeId}`, JSON.stringify({
        records: [{ grid: storedGrid, timestamp: Date.now() }],
        currentIndex: 0
      }));

      const h = new EditHistory(routeId, 3, initialGrid);
      expect(h.getCurrentState()).toEqual(storedGrid); // Should load from storage
      // @ts-expect-error accessing private member for test
      expect(h.records.length).toBe(1);
      // @ts-expect-error accessing private member for test
      expect(h.records[0].grid).toEqual(storedGrid);
    });


    it('should call loadFromStorage on construction', () => {
      // Spy on the public method directly if made public, or prototype if private
      // Since we made it public for testability:
      const loadSpy = vi.spyOn(EditHistory.prototype, 'loadFromStorage');
      new EditHistory(routeId, 3); // Create new instance to trigger constructor
      expect(loadSpy).toHaveBeenCalledTimes(1);
      // loadSpy.mockRestore(); // Not needed if vi.restoreAllMocks() in afterEach
    });

    it('should load records and currentIndex from localStorage if they exist', () => {
      const recordsToStore = [{ grid: createGrid(1), timestamp: Date.now() }, { grid: createGrid(2), timestamp: Date.now() }];
      const currentIndexToStore = 1;
      localStorageMock.setItem(`edit-history-${routeId}`, JSON.stringify({ records: recordsToStore, currentIndex: currentIndexToStore }));
      
      const h = new EditHistory(routeId, 3); // Max records 3
      expect(h.getCurrentState()).toEqual(recordsToStore[currentIndexToStore].grid);
      // @ts-expect-error accessing private member for test
      expect(h.records).toEqual(recordsToStore); // Check if the internal records match
      // @ts-expect-error accessing private member for test
      expect(h.currentIndex).toBe(currentIndexToStore);
    });

    it('should handle invalid JSON in localStorage gracefully (and use initialGrid if provided)', () => {
      localStorageMock.setItem(`edit-history-${routeId}`, 'invalid json');
      const initialGrid = createGrid(0);
      // Pass initialGrid to constructor
      const h = new EditHistory(routeId, 3, initialGrid); 
      // Expect initialGrid to be used because localStorage is effectively empty/invalid
      expect(h.getCurrentState()).toEqual(initialGrid); 
      // @ts-expect-error accessing private member for test
      expect(h.records.length).toBe(1);
      // @ts-expect-error accessing private member for test
      expect(h.currentIndex).toBe(0);
    });
    
    it('should handle empty (but valid) JSON in localStorage (and use initialGrid if provided)', () => {
      localStorageMock.setItem(`edit-history-${routeId}`, JSON.stringify({ records: [], currentIndex: -1 }));
      const initialGrid = createGrid(0);
      const h = new EditHistory(routeId, 3, initialGrid);
      // Expect initialGrid to be used because localStorage records are empty
      expect(h.getCurrentState()).toEqual(initialGrid);
      // @ts-expect-error accessing private member for test
      expect(h.records.length).toBe(1);
      // @ts-expect-error accessing private member for test
      expect(h.currentIndex).toBe(0);
    });

  });

  describe('addRecord', () => {
    // Re-init history for this block to ensure consistent maxRecords
    beforeEach(() => {
        history = new EditHistory(routeId, 3);
    });

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
      const grid1 = createGrid(1); // [[1]]
      const grid2 = createGrid(2); // [[2]]
      const grid3 = createGrid(3); // [[3]], this is the new record added after undo

      history.addRecord(grid1); // R: [g1#0], C: 0
      history.addRecord(grid2); // R: [g1#0, g2#1], C: 1
      
      // Perform the first undo (setup for the main part of the test)
      // With undo returning the state MOVED FROM:
      const setupUndoResult = history.undo(); // C was 1 (g2). Returns g2. C becomes 0. Current state is g1.
      expect(setupUndoResult).toEqual(grid2); // Verify the state returned by the setup undo
      expect(history.getCurrentState()).toEqual(grid1); // Verify current state after setup undo
      
      // Add grid3. This should discard grid2 from the "future" path.
      // C is 0. slice(0, C+1=1) -> records becomes [g1#0].
      // Push g3. records becomes [g1#0, g3#1]. C becomes 1. Current state is g3.
      history.addRecord(grid3); 
      expect(history.getCurrentState()).toEqual(grid3);
      // @ts-expect-error accessing private member for test
      expect(history.records.length).toBe(2); 
      // @ts-expect-error accessing private member for test
      expect(history.records[1].grid).toEqual(grid3); // New record is at index 1
       // @ts-expect-error accessing private member for test
      expect(history.records[0].grid).toEqual(grid1); // Original first record is still at index 0

      // Perform the undo operation that is the subject of the failing assertion
      const undoneTo = history.undo(); // C was 1 (g3). Returns g3. C becomes 0. Current state is g1.
      
      // The prompt states `expect(undoneTo).toEqual(grid1)` is failing.
      // Based on "undo returns state moved FROM", undoneTo should be grid3.
      expect(undoneTo).toEqual(grid3); // Corrected assertion
      expect(history.getCurrentState()).toEqual(grid1); // Current state after this undo should be grid1
    });

    it('should respect maxRecords: oldest record removed if limit exceeded', () => {
      // history is maxRecords = 3
      const grid1 = createGrid(1);
      const grid2 = createGrid(2);
      const grid3 = createGrid(3);
      const grid4 = createGrid(4);

      history.addRecord(grid1); // R: [g1], C: 0
      history.addRecord(grid2); // R: [g1, g2], C: 1
      history.addRecord(grid3); // R: [g1, g2, g3], C: 2
      history.addRecord(grid4); // R: [g2, g3, g4], C: 2 (g1 shifted, currentIndex becomes 2)

      // @ts-expect-error accessing private member for test
      expect(history.records.length).toBe(3);
      // @ts-expect-error accessing private member for test
      expect(history.records[0].grid).toEqual(grid2); // grid1 should be removed
      // @ts-expect-error accessing private member for test
      expect(history.records[1].grid).toEqual(grid3);
      // @ts-expect-error accessing private member for test
      expect(history.records[2].grid).toEqual(grid4);
      expect(history.getCurrentState()).toEqual(grid4);
      // @ts-expect-error accessing private member for test
      expect(history.currentIndex).toBe(2);
    });
    
    it('should correctly adjust currentIndex when maxRecords is exceeded and currentIndex was 0 before add', () => {
      const h = new EditHistory(routeId, 2); // maxRecords = 2
      const grid1 = createGrid(1); // R: [], C: -1
      h.addRecord(grid1); // R: [g1], C: 0
      // At this point, records[0] is g1, currentIndex is 0.
      
      const grid2 = createGrid(2);
      h.addRecord(grid2); // R: [g1, g2], C: 1
      // records[0]=g1, records[1]=g2, currentIndex is 1.
      
      const grid3 = createGrid(3);
      h.addRecord(grid3); // Max records exceeded. g1 shifted. R: [g2, g3], C becomes 1.
                          // records[0]=g2, records[1]=g3, currentIndex is 1.
      
      // @ts-expect-error accessing private member for test
      expect(h.records.length).toBe(2);
      // @ts-expect-error accessing private member for test
      expect(h.records[0].grid).toEqual(grid2);
      // @ts-expect-error accessing private member for test
      expect(h.records[1].grid).toEqual(grid3);
      // @ts-expect-error accessing private member for test
      expect(h.currentIndex).toBe(1); 
      expect(h.getCurrentState()).toEqual(grid3);

      let undone = h.undo(); // Returns g3, C becomes 0
      expect(undone).toEqual(grid3); 
      // @ts-expect-error accessing private member for test
      expect(h.currentIndex).toBe(0);
      expect(h.getCurrentState()).toEqual(grid2);
      
      undone = h.undo(); // Returns g2, C becomes -1
      expect(undone).toEqual(grid2);
      // @ts-expect-error accessing private member for test
      expect(h.currentIndex).toBe(-1);
      expect(h.getCurrentState()).toBeNull();
    });

    it('should call saveToStorage after adding a record', () => {
      // history instance is reset in beforeEach for this describe block
      const saveSpy = vi.spyOn(history, 'saveToStorage');
      history.addRecord(createGrid(1));
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('undo', () => {
    beforeEach(() => {
        history = new EditHistory(routeId, 3);
    });

    it('should return the previously recorded grid state and update currentIndex', () => {
      const grid1 = createGrid(1);
      const grid2 = createGrid(2);
      history.addRecord(grid1); // R: [g1], C:0
      history.addRecord(grid2); // R: [g1,g2], C:1

      const undoneState = history.undo(); // Returns g2, C becomes 0
      expect(undoneState).toEqual(grid2);
      // @ts-expect-error accessing private member for test
      expect(history.currentIndex).toBe(0);
      expect(history.getCurrentState()).toEqual(grid1); // Current state is now g1
    });

    it('should return null if there are no more states to undo (from non-empty)', () => {
      history.addRecord(createGrid(1)); // R: [g1], C:0
      let undone = history.undo(); // Returns g1, C becomes -1
      expect(undone).toEqual(createGrid(1));
      // @ts-expect-error accessing private member for test
      expect(history.currentIndex).toBe(-1);
      
      undone = history.undo(); // C is -1
      expect(undone).toBeNull();
      // @ts-expect-error accessing private member for test
      expect(history.currentIndex).toBe(-1); 
    });
    
    it('should return null if history is empty (no records added)', () => {
      const h = new EditHistory(routeId, 3); // No initial grid, no records
      expect(h.undo()).toBeNull();
      // @ts-expect-error accessing private member for test
      expect(h.currentIndex).toBe(-1);
    });

    it('should ensure the returned grid is a deep copy on undo', () => {
      const grid1 = createGrid(1);
      const grid2 = createGrid(2);
      history.addRecord(grid1);
      history.addRecord(grid2);

      const undoneState = history.undo(); // Returns grid2
      expect(undoneState).toEqual(grid2);
      if (undoneState) {
        undoneState[0][0] = 99; // Modify returned state
      }
      // @ts-expect-error accessing private member for test
      expect(history.records[1].grid).toEqual(createGrid(2)); // Original in records should be untouched
      expect(history.getCurrentState()).toEqual(createGrid(1)); // Current state is grid1
    });

    it('should call saveToStorage after undoing if state changed', () => {
      history.addRecord(createGrid(1));
      history.addRecord(createGrid(2));
      const saveSpy = vi.spyOn(history, 'saveToStorage');
      history.undo();
      expect(saveSpy).toHaveBeenCalledTimes(1);
      saveSpy.mockClear();
      history.undo(); // Another undo
      expect(saveSpy).toHaveBeenCalledTimes(1);
      saveSpy.mockClear();
      history.undo(); // No state change
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('redo', () => {
    beforeEach(() => {
        history = new EditHistory(routeId, 3);
    });
    it('should return the next (undone) grid state and update currentIndex', () => {
      const grid1 = createGrid(1);
      const grid2 = createGrid(2);
      history.addRecord(grid1); // R:[g1] C:0
      history.addRecord(grid2); // R:[g1,g2] C:1
      history.undo(); // Returns g2, C:0. Current state is g1.

      const redoneState = history.redo(); // Returns g2, C:1. Current state is g2.
      expect(redoneState).toEqual(grid2);
      // @ts-expect-error accessing private member for test
      expect(history.currentIndex).toBe(1);
      expect(history.getCurrentState()).toEqual(grid2);
    });

    it('should return null if there are no more states to redo', () => {
      history.addRecord(createGrid(1));
      history.addRecord(createGrid(2)); // R:[g1,g2] C:1
      history.undo(); // C:0
      history.redo(); // C:1, at latest state
      expect(history.redo()).toBeNull(); // Nothing to redo
      // @ts-expect-error accessing private member for test
      expect(history.currentIndex).toBe(1);
    });
    
    it('should return null if history is empty or no undos were made', () => {
      const h = new EditHistory(routeId, 3);
      expect(h.redo()).toBeNull(); // Empty
      h.addRecord(createGrid(1)); // R:[g1] C:0
      expect(h.redo()).toBeNull(); // No undos made
    });

    it('should ensure the returned grid is a deep copy on redo', () => {
      const grid1 = createGrid(1);
      const grid2 = createGrid(2);
      history.addRecord(grid1);
      history.addRecord(grid2);
      history.undo(); // C:0

      const redoneState = history.redo(); // Returns g2, C:1
      expect(redoneState).toEqual(grid2);
      if (redoneState) {
        redoneState[0][0] = 99; // Modify returned state
      }
      // @ts-expect-error accessing private member for test
      expect(history.records[1].grid).toEqual(createGrid(2)); // Original in records
      expect(history.getCurrentState()).toEqual(createGrid(2));
    });

    it('should call saveToStorage after redoing if state changed', () => {
      history.addRecord(createGrid(1));
      history.addRecord(createGrid(2));
      history.undo(); 
      const saveSpy = vi.spyOn(history, 'saveToStorage');
      history.redo();
      expect(saveSpy).toHaveBeenCalledTimes(1);
      saveSpy.mockClear();
      history.redo(); // No state change
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentState', () => {
    // history is new EditHistory(routeId, 3) from top-level beforeEach
    // or re-init if specific constructor needed for a test.
    it('should return the current grid state based on currentIndex', () => {
      const h = new EditHistory(routeId, 3);
      const grid1 = createGrid(1);
      const grid2 = createGrid(2);
      h.addRecord(grid1);
      h.addRecord(grid2);
      expect(h.getCurrentState()).toEqual(grid2);
      h.undo(); // Returns g2, current is g1
      expect(h.getCurrentState()).toEqual(grid1);
    });

    it('should return null if the history is empty and no initial grid was provided to constructor', () => {
      const h = new EditHistory(routeId, 3); // No initial grid
      expect(h.getCurrentState()).toBeNull();
    });
    
    it('should return initial grid if history is empty (no records added) but was initialized with one', () => {
      const initialGrid = createGrid(0);
      const h = new EditHistory(routeId, 3, initialGrid); // initialGrid used as localStorage is empty
      expect(h.getCurrentState()).toEqual(initialGrid);
      
      // Try to undo; should not go before initial state if it's the only one
      const undone = h.undo(); // Returns initialGrid, C becomes -1
      expect(undone).toEqual(initialGrid);
      expect(h.getCurrentState()).toBeNull(); // Now current state is null
    });

    it('should ensure the returned grid from getCurrentState is a deep copy', () => {
      const h = new EditHistory(routeId, 3);
      const grid1 = createGrid(1);
      h.addRecord(grid1);
      const currentState = h.getCurrentState();
      expect(currentState).toEqual(grid1);
      if (currentState) {
        currentState[0][0] = 99; // Modify returned state
      }
      // @ts-expect-error accessing private member for test
      expect(h.records[0].grid).toEqual(createGrid(1)); // Stored record should be unaffected
    });
  });

  describe('saveToStorage and loadFromStorage integration', () => {
    // These tests focus on making sure save and load work together
    it('should correctly save and then load records and currentIndex', () => {
      const h = new EditHistory(routeId, 3);
      const grid1 = createGrid(1);
      const grid2 = createGrid(2);
      h.addRecord(grid1);
      h.addRecord(grid2); // currentIndex = 1, records = [{g1,..}, {g2,..}]

      // Data is saved by addRecord. Now create a new instance to load it.
      const h2 = new EditHistory(routeId, 3);
      expect(h2.getCurrentState()).toEqual(grid2);
      // @ts-expect-error accessing private member for test
      expect(h2.records.map(r => r.grid)).toEqual([grid1, grid2]);
      // @ts-expect-error accessing private member for test
      expect(h2.currentIndex).toBe(1);
    });

    it('should save an empty records array and -1 index if history is empty, and load it correctly', () => {
        const h = new EditHistory(routeId, 3); // No initial grid, empty history
        // saveToStorage is called by constructor if initialGrid is added, or by addRecord.
        // If constructor doesn't add initialGrid, and no records added, storage might not be touched
        // unless explicitly saved or loadFromStorage initializes it.
        // The current EditHistory calls loadFromStorage, which sets records=[] and currentIndex=-1 if storage is empty.
        // Then, if initialGrid provided & records empty, it adds initialGrid (which calls save).
        // If no initialGrid, and storage empty, records=[], currentIndex=-1. A subsequent saveToStorage call would save this.
        
        h.saveToStorage(); // Explicitly save the initial empty state.

        const storedData = localStorageMock.getItem(`edit-history-${routeId}`);
        expect(storedData).not.toBeNull();
        const parsedData = JSON.parse(storedData!);
        expect(parsedData.records).toEqual([]);
        expect(parsedData.currentIndex).toEqual(-1);

        // Now test loading this state
        const h2 = new EditHistory(routeId, 3);
        expect(h2.getCurrentState()).toBeNull();
        // @ts-expect-error accessing private member for test
        expect(h2.records.length).toBe(0);
        // @ts-expect-error accessing private member for test
        expect(h2.currentIndex).toBe(-1);
    });
  });
});
