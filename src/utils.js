'use strict';

import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

export const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_PATH = `${__dirname}/../package.json`;
export const APP_VERSION = getAppVersion();

/**
 * @param  {string} text
 * @returns {string}
 */
export function textToCenter(text) {
  // Real line length with Escape sequences (visual length) remove
  const clearText = text.replace(/\033[[0-9;]*m/g, '');
  const windowWidth = process.stdout.getWindowSize ? process.stdout.getWindowSize()[0] : 0;
  const spaces = Math.floor(windowWidth / 2 - clearText.length / 2);

  return ' '.repeat(spaces >= 1 ? spaces : 0) + text;
}

/**
 * @returns {string}
 */
function getAppVersion() {
  try {
    const package_file = fs.readFileSync(PACKAGE_PATH, 'utf8');
    const package_obj = JSON.parse(package_file);
    return 'v' + package_obj?.version;
  } catch (err) {
    return 'v0.0.0';
  }
}

export function isVerbose() {
  return !process.env.VERBOSE_OFF;
}
