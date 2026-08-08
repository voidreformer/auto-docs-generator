#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');

console.log('📄 DocuForge AI — Enterprise AI Documentation Generator & Codebase RAG v1.0.0');
console.log('🔗 Launching local server at http://localhost:3003 ...');

const serverPath = path.join(__dirname, '../server.js');
const serverProcess = spawn('node', [serverPath], { stdio: 'inherit' });

serverProcess.on('close', (code) => {
  process.exit(code);
});
