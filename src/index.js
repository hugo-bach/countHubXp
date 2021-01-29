#!/usr/bin/env node
'use strict';

import { run } from './app.js';

process.title = 'Count Hub Xp';

run().catch((err) => {
  console.error(err);
});
