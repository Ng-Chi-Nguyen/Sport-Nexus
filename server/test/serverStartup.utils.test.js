import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { attachPortConflictHandler } from '../src/utils/serverStartup.utils.js';

test('attachPortConflictHandler reports a friendly message for EADDRINUSE', () => {
  const server = new EventEmitter();
  const logs = [];
  let exitCode;

  attachPortConflictHandler(server, 8081, {
    error: (...args) => logs.push(args.join(' '))
  }, (code) => {
    exitCode = code;
  });

  server.emit('error', Object.assign(new Error('listen EADDRINUSE'), { code: 'EADDRINUSE' }));

  assert.equal(exitCode, 1);
  assert.match(logs.join('\n'), /cổng 8081/i);
  assert.match(logs.join('\n'), /EADDRINUSE/);
});
