import { maximum_history_length } from '@products/pitch-craft/constants/editor';

export class HistoryManager {
  constructor() {
    this.states = [];
    this.currentIndex = -1;
    this.locked = false;
    this.initialized = false; // Track if history has been properly initialized
  }

  save(state, force = false) {
    if (this.locked && !force) return; // Prevent saving during undo/redo operations

    // Don't save if it's the same as the current state (unless forced)
    if (
      !force &&
      this.currentIndex >= 0 &&
      this.states[this.currentIndex] === state
    ) {
      return;
    }

    // If we're not at the end of history (after undoing), remove future states
    if (this.currentIndex < this.states.length - 1) {
      this.states = this.states.slice(0, this.currentIndex + 1);
    }

    // Add new state
    this.states.push(state);
    this.currentIndex = this.states.length - 1;
    this.initialized = true;

    // Limit history size to prevent memory issues
    if (this.states.length > maximum_history_length) {
      this.states.shift();
      this.currentIndex = Math.max(0, this.currentIndex - 1);
    }
  }

  undo() {
    if (!this.canUndo()) return null;

    this.locked = true;
    this.currentIndex--;
    const state = this.states[this.currentIndex];
    this.locked = false;

    return state;
  }

  redo() {
    if (!this.canRedo()) return null;

    this.locked = true;
    this.currentIndex++;
    const state = this.states[this.currentIndex];
    this.locked = false;

    return state;
  }

  // Initialize with a state (used for templates and new slides)
  initialize(initialState) {
    this.states = [initialState];
    this.currentIndex = 0;
    this.locked = false;
    this.initialized = true;
  }

  // Clear completely (used when switching slides)
  clear() {
    this.states = [];
    this.currentIndex = -1;
    this.locked = false;
    this.initialized = false;
  }

  canUndo() {
    return this.currentIndex > 0 && this.states.length > 1;
  }

  canRedo() {
    return this.currentIndex < this.states.length - 1;
  }

  isInitialized() {
    return this.initialized;
  }

  getCurrentState() {
    return this.currentIndex >= 0 ? this.states[this.currentIndex] : null;
  }

  // Get total number of states for debugging
  getStateCount() {
    return this.states.length;
  }

  // Debug helper
  getStateInfo() {
    return {
      totalStates: this.states.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      locked: this.locked,
      initialized: this.initialized,
    };
  }
}
