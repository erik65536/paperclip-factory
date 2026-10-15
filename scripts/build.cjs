const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
fs.mkdirSync(path.join(root, 'dist'), {recursive:true});
fs.copyFileSync(path.join(root, 'index.html'), path.join(root, 'dist/index.html'));
console.log('Built dist/index.html — no external assets or dependencies.');
