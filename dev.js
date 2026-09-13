#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const rootDir = __dirname;
const serverDir = path.join(rootDir, 'server');
const clientDir = path.join(rootDir, 'client');

console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════');
console.log('\x1b[36m%s\x1b[0m', '       STARTING QUESTLIFE FULL STACK          ');
console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════');
console.log('-> Server: http://localhost:4000');
console.log('-> Client: http://localhost:5173\n');

function runProcess(name, cmd, args, cwd, color) {
  const proc = spawn(cmd, args, { cwd, shell: true, stdio: ['inherit', 'pipe', 'pipe'] });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
      if (line.trim()) {
        console.log(`${color}[${name}]\x1b[0m ${line}`);
      }
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
      if (line.trim()) {
        console.error(`${color}[${name} ERR]\x1b[0m ${line}`);
      }
    });
  });

  proc.on('close', (code) => {
    console.log(`${color}[${name}]\x1b[0m Process exited with code ${code}`);
  });

  return proc;
}

const serverProc = runProcess('SERVER', 'npm', ['run', 'dev'], serverDir, '\x1b[33m');
const clientProc = runProcess('CLIENT', 'npm', ['run', 'dev'], clientDir, '\x1b[32m');

function cleanup() {
  console.log('\nStopping QuestLife processes...');
  serverProc.kill();
  clientProc.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
