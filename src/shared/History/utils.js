// History Utility functions
import { useCallback } from 'react';
import { EXCLUDE_PATTERNS } from './constants';
import {sceneTypeOptionList} from '../../products/cine-scribe/constants/ScriptConstant';

export const shouldExcludeField = key => {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(key));
};

// Decode scene_type number to human-readable value
const decodeSceneType = sceneTypeId => {
  const scene = sceneTypeOptionList.find(item => item.id === sceneTypeId);
  return scene ? scene.value : `Unknown (${sceneTypeId})`;
};

// Filter object fields and decode scene_type
export const filterObjectFields = data => {

  if (typeof data !== 'object' || data === null) return data;

  const filteredData = {};

  Object.entries(data).forEach(([key, value]) => {
    if (!shouldExcludeField(key)) {
      // Replace scene_type with decoded value
      if (key === 'scene_type') {
        filteredData[key] = decodeSceneType(value);
      } else {
        filteredData[key] = value;
      }
    }
  });

  return filteredData;
};


export const getNestedValue = (obj, path) => {
  if (!obj) return undefined;
  const keys = path.split(/\.|\?\./); // split by . or ?.
  return keys.reduce((acc, key) => {
    if (key.endsWith(']')) {
      const [arrayKey, index] = key.split(/\[|\]/);
      return acc?.[arrayKey]?.[index];
    }
    return acc?.[key];
  }, obj);
};

export const sortHistoryData = (data, { key, direction }) => {

  return [...data].sort((a, b) => {
    const aValue = getNestedValue(a, key);
    const bValue = getNestedValue(b, key);

    if (aValue === undefined || aValue === null)
      return direction === 'asc' ? 1 : -1;
    if (bValue === undefined || bValue === null)
      return direction === 'asc' ? -1 : 1;

    if (key === 'operation_executed_at') {
      const dateA = new Date(aValue);
      const dateB = new Date(bValue);
      return direction === 'asc' ? dateA - dateB : dateB - dateA;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return direction === 'asc' ? aValue - bValue : bValue - aValue;
  });
};

export const isObject = val =>
  val !== null && typeof val === 'object' && !Array.isArray(val);

export const deepDiff = (oldVal, newVal, pathArr = []) => {
  if (oldVal === newVal) return {};
  const differences = {};

  const allKeys = new Set([
    ...Object.keys(oldVal || {}),
    ...Object.keys(newVal || {}),
  ]);

  for (const key of allKeys) {
    const newPathArr = [...pathArr, key];
    const fullPath = newPathArr.join('?.');

    const vOld = oldVal?.[key];
    const vNew = newVal?.[key];

    if (isObject(vOld) || isObject(vNew)) {
      Object.assign(differences, deepDiff(vOld, vNew, newPathArr));
    } else if (Array.isArray(vOld) && Array.isArray(vNew)) {
      if (vOld.length !== vNew.length) {
        differences[fullPath] = {
          old: vOld,
          new: vNew,
          type: 'array',
        };
      } else {
        for (let i = 0; i < vOld.length; i++) {
          const nestedDiffs = deepDiff(vOld[i], vNew[i], [...newPathArr, i]);
          if (Object.keys(nestedDiffs).length > 0) {
            differences[`${fullPath}[${i}]`] = {
              old: vOld[i],
              new: vNew[i],
              type: 'object',
            };
          }
        }
      }
    } else if (vOld !== vNew) {
      differences[fullPath] = {
        old: vOld,
        new: vNew,
        type: typeof vOld,
      };
    }
  }

  return differences;
};
