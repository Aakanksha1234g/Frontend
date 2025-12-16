import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import React from 'react';

// * This file is initial setup for vitest which reduces number of imports in subsequent test files and setup few important globals

// Custom render function to avoid repetitive imports
const customRender = (ui, { route = '/', ...options } = {}) => {
  return render(
    React.createElement(MemoryRouter, { initialEntries: [route] }, ui),
    options
  );
};

// Extend Vitest globals
globalThis.render = customRender;
globalThis.screen = screen;
globalThis.fireEvent = fireEvent;
globalThis.waitFor = waitFor;
globalThis.vi = vi;
globalThis.describe = describe;
globalThis.it = it;
globalThis.expect = expect;
globalThis.userEvent = userEvent;

// Re-export everything from testing-library/react
export * from '@testing-library/react';
export { customRender as render };
