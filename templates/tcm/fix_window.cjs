const fs = require('fs');
const path = require('path');

const dirs = ['models', 'controllers', 'views'];

for (const dir of dirs) {
    const p = path.join('src', dir);
    const files = fs.readdirSync(p);
    for (const f of files) {
        if (f.endsWith('.js')) {
            const filePath = path.join(p, f);
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;

            // Find window.funcName = function(...) {
            content = content.replace(/window\.([a-zA-Z0-9_]+)\s*=\s*function\s*\((.*?)\)\s*\{/g, (match, funcName, args) => {
                modified = true;
                return `export function ${funcName}(${args}) {\n    window.${funcName} = ${funcName}; // preserve global`;
            });

            if (modified) {
                fs.writeFileSync(filePath, content, 'utf8');
            }
        }
    }
}
console.log('Fixed window functions to be ES exports');
