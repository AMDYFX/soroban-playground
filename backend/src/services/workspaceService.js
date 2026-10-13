// Copyright (c) 2026 StellarDevTools
// SPDX-License-Identifier: MIT

export const WORKSPACE_LIMITS = {
  maxOpenFiles: 50,
  maxPinnedPresets: 100,
  maxPinnedSnippets: 100,
  maxHistoryEntries: 200,
  maxFavorites: 500,
};

const WORKSPACE_KEYS = new Set([
  'openFiles',
  'activeFile',
  'network',
  'pinnedPresetIds',
  'pinnedSnippetIds',
  'sidebarCollapsed',
  'fontSize',
  'splitRatio',
  'theme',
  'tabSize',
  'wordWrap',
  'minimap',
  'lineNumbers',
  'autoSave',
  'autoSaveDelay',
  'formatOnSave',
  'files',
]);

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function sanitizeStringArray(arr, limit = 50) {
  if (!Array.isArray(arr)) return [];
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    if (typeof item === 'string' && item.length > 0 && !seen.has(item)) {
      seen.add(item);
      out.push(item);
    }
  }
  return out.slice(-limit);
}

export function normalizeWorkspace(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }

  const normalized = {};
  for (const [key, value] of Object.entries(raw)) {
    if (FORBIDDEN_KEYS.has(key)) continue;
    if (!WORKSPACE_KEYS.has(key)) continue;

    if (key === 'openFiles') {
      normalized[key] = sanitizeStringArray(
        value,
        WORKSPACE_LIMITS.maxOpenFiles
      );
    } else if (key === 'pinnedPresetIds') {
      normalized[key] = sanitizeStringArray(
        value,
        WORKSPACE_LIMITS.maxPinnedPresets
      );
    } else if (key === 'pinnedSnippetIds') {
      normalized[key] = sanitizeStringArray(
        value,
        WORKSPACE_LIMITS.maxPinnedSnippets
      );
    } else {
      normalized[key] = value;
    }
  }

  return normalized;
}

export function validateWorkspace(raw) {
  if (raw === undefined || raw === null) {
    return {};
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Workspace must be an object');
  }
  return normalizeWorkspace(raw);
}

export function mergeWorkspace(current = {}, incoming = {}) {
  const normCurrent = normalizeWorkspace(current);
  const normIncoming = normalizeWorkspace(incoming);
  return {
    ...normCurrent,
    ...normIncoming,
  };
}

export default {
  WORKSPACE_LIMITS,
  normalizeWorkspace,
  validateWorkspace,
  mergeWorkspace,
};
