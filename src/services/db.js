// src/services/db.js
// Client Database Service for Backend Dev Prep
// Guarantees rock-solid persistence across refreshes,
// atomic per-question timer balances, and race-free state transitions.

export const QUESTION_TIMER_SECONDS = 20 * 60; // 1200 seconds (20 Minutes)
export const SCRIPT_TIMER_SECONDS = 5 * 60;    // 300 seconds (5 Minutes)

const DB_STORAGE_KEY = 'backend_dev_zen_db_v4';
const LEGACY_PREFIX = 'backend_dev_zen_v3_';

function getDefaultState() {
  return {
    version: 4,
    activeTrack: 'django',
    activeQuestion: {
      django: 1,
      python: 1,
    },
    strictLock: true,
    completed: {},     // { [track_qid]: boolean }
    tabChecks: {},     // { [track_qid_tabId]: boolean }
    notes: {},         // { [track_qid]: string }
    timers: {},        // { [track_qid]: { secondsLeft, scriptSecondsLeft, isRunning, lastTimestamp } }
  };
}

class StorageDB {
  constructor() {
    this.memoryState = this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(DB_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            ...getDefaultState(),
            ...parsed,
            activeQuestion: {
              ...getDefaultState().activeQuestion,
              ...(parsed.activeQuestion || {}),
            },
            completed: parsed.completed || {},
            tabChecks: parsed.tabChecks || {},
            notes: parsed.notes || {},
            timers: parsed.timers || {},
          };
        }
      }
    } catch (e) {
      console.warn('StorageDB load error:', e);
    }

    // Try migrating legacy keys if first time loading v4
    return this._migrateLegacy();
  }

  _migrateLegacy() {
    const state = getDefaultState();
    try {
      const legacyTrack = localStorage.getItem(LEGACY_PREFIX + 'track');
      if (legacyTrack === 'python' || legacyTrack === 'django') {
        state.activeTrack = legacyTrack;
      }

      const legacyPyQid = localStorage.getItem(LEGACY_PREFIX + 'qid_python');
      if (legacyPyQid) state.activeQuestion.python = parseInt(legacyPyQid, 10) || 1;

      const legacyDjQid = localStorage.getItem(LEGACY_PREFIX + 'qid_django');
      if (legacyDjQid) state.activeQuestion.django = parseInt(legacyDjQid, 10) || 1;

      const legacyStrict = localStorage.getItem(LEGACY_PREFIX + 'strict_lock');
      if (legacyStrict !== null) state.strictLock = legacyStrict === 'true';

      const legacyCompleted = localStorage.getItem(LEGACY_PREFIX + 'completed');
      if (legacyCompleted) state.completed = JSON.parse(legacyCompleted) || {};

      const legacyTabs = localStorage.getItem(LEGACY_PREFIX + 'tab_checks');
      if (legacyTabs) state.tabChecks = JSON.parse(legacyTabs) || {};

      const legacyNotes = localStorage.getItem(LEGACY_PREFIX + 'notes');
      if (legacyNotes) state.notes = JSON.parse(legacyNotes) || {};
    } catch (e) {
      console.warn('Legacy migration notice:', e);
    }
    this._persist(state);
    return state;
  }

  _persist(state = this.memoryState) {
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('StorageDB persist error:', e);
    }
  }

  // --- GETTERS & SETTERS ---
  getState() {
    return this.memoryState;
  }

  getActiveTrack() {
    return this.memoryState.activeTrack || 'django';
  }

  setActiveTrack(trackId) {
    this.memoryState.activeTrack = trackId;
    this._persist();
  }

  getActiveQuestion(trackId) {
    const tid = trackId || this.memoryState.activeTrack;
    return this.memoryState.activeQuestion[tid] || 1;
  }

  setActiveQuestion(trackId, qId) {
    const tid = trackId || this.memoryState.activeTrack;
    this.memoryState.activeQuestion[tid] = qId;
    this._persist();
  }

  getStrictLock() {
    return this.memoryState.strictLock ?? true;
  }

  setStrictLock(val) {
    this.memoryState.strictLock = !!val;
    this._persist();
  }

  getCompletedMap() {
    return { ...this.memoryState.completed };
  }

  setCompleted(trackId, qId, isDone) {
    const key = `${trackId}_${qId}`;
    if (isDone) {
      this.memoryState.completed[key] = true;
      // Mark timers as finished for this completed question
      this.saveQuestionTimer(trackId, qId, {
        secondsLeft: 0,
        scriptSecondsLeft: 0,
        isRunning: false,
      });
    } else {
      delete this.memoryState.completed[key];
    }
    this._persist();
  }

  getTabChecksMap() {
    return { ...this.memoryState.tabChecks };
  }

  setTabCheck(trackId, qId, tabId, isChecked) {
    const key = `${trackId}_${qId}_${tabId}`;
    if (isChecked) {
      this.memoryState.tabChecks[key] = true;
    } else {
      delete this.memoryState.tabChecks[key];
    }
    this._persist();
  }

  setAllTabChecksForQuestion(trackId, qId, tabIds, isChecked) {
    for (const tabId of tabIds) {
      const key = `${trackId}_${qId}_${tabId}`;
      if (isChecked) {
        this.memoryState.tabChecks[key] = true;
      } else {
        delete this.memoryState.tabChecks[key];
      }
    }
    this._persist();
  }

  getNotesMap() {
    return { ...this.memoryState.notes };
  }

  setNote(trackId, qId, text) {
    const key = `${trackId}_${qId}`;
    this.memoryState.notes[key] = text;
    this._persist();
  }

  // --- TIMER MANAGEMENT (ATOMIC & PERSISTENT) ---
  getQuestionTimer(trackId, qId, isCompleted = false) {
    const key = `${trackId}_${qId}`;
    const saved = this.memoryState.timers[key];

    // If marked completed, timer is always 0
    if (isCompleted || this.memoryState.completed[key]) {
      return {
        secondsLeft: 0,
        scriptSecondsLeft: 0,
        isRunning: false,
      };
    }

    if (!saved) {
      // First time opening this question: start fresh with 20m countdown!
      return {
        secondsLeft: QUESTION_TIMER_SECONDS,
        scriptSecondsLeft: SCRIPT_TIMER_SECONDS,
        isRunning: true,
      };
    }

    let secondsLeft = typeof saved.secondsLeft === 'number' ? saved.secondsLeft : QUESTION_TIMER_SECONDS;
    let scriptSecondsLeft = typeof saved.scriptSecondsLeft === 'number' ? saved.scriptSecondsLeft : SCRIPT_TIMER_SECONDS;
    let isRunning = saved.isRunning ?? true;

    // Handle elapsed time across page refreshes if the timer was running
    if (isRunning && saved.lastTimestamp) {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - saved.lastTimestamp) / 1000);
      if (elapsedSeconds > 0) {
        secondsLeft = Math.max(0, secondsLeft - elapsedSeconds);
        scriptSecondsLeft = Math.max(0, scriptSecondsLeft - elapsedSeconds);
      }
    }

    return {
      secondsLeft,
      scriptSecondsLeft,
      isRunning: secondsLeft > 0 ? isRunning : false,
    };
  }

  saveQuestionTimer(trackId, qId, { secondsLeft, scriptSecondsLeft, isRunning }) {
    const key = `${trackId}_${qId}`;
    this.memoryState.timers[key] = {
      secondsLeft: Math.max(0, secondsLeft ?? QUESTION_TIMER_SECONDS),
      scriptSecondsLeft: Math.max(0, scriptSecondsLeft ?? SCRIPT_TIMER_SECONDS),
      isRunning: !!isRunning,
      lastTimestamp: Date.now(),
    };
    this._persist();
  }

  resetAll() {
    this.memoryState = getDefaultState();
    this._persist();
  }
}

export const db = new StorageDB();
export default db;

