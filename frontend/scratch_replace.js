const fs = require('fs');
const path = require('path');

const replacements = [
    ['hover:bg-white/[0.02]', 'hover:bg-white/2'],
    ['flex-shrink-0', 'shrink-0'],
    ['bg-[var(--accent)]/20', 'bg-(--accent)/20'],
    ['bg-[var(--accent)]', 'bg-accent'],
    ['hover:bg-[var(--accent-hover)]', 'hover:bg-accent-hover'],
    ['shadow-[var(--accent)]/20', 'shadow-(--accent)/20'],
    ['border-[var(--accent)]', 'border-accent'],
    ['focus:border-[var(--accent)]', 'focus:border-accent'],
    ['[color-scheme:dark]', 'scheme-dark'],
    ['text-[var(--accent)]', 'text-accent'],
    ['hover:text-[var(--accent-light)]', 'hover:text-accent-light'],
    ['bg-gradient-to-t', 'bg-linear-to-t'],
    ['bg-gradient-to-br', 'bg-linear-to-br'],
    ['aspect-[2/3]', 'aspect-2/3'],
    ['border-[var(--surface-border)]', 'border-surface-border'],
    ['text-[var(--accent-light)]', 'text-accent-light'],
    ['bg-[var(--accent-light)]', 'bg-accent-light'],
    ['bg-[var(--surface-border)]', 'bg-surface-border'],
    ['divide-[var(--surface-border)]', 'divide-surface-border'],
    ['hover:border-[var(--accent)]', 'hover:border-accent'],
    ['hover:bg-[var(--accent)]/10', 'hover:bg-(--accent)/10'],
    ['hover:bg-[var(--accent)]/20', 'hover:bg-(--accent)/20'],
    ['border-[var(--accent)]/20', 'border-(--accent)/20'],
    ['hover:text-[var(--accent)]', 'hover:text-accent'],
    ['top-[80px]', 'top-20'],
    ['focus:ring-[var(--accent)]', 'focus:ring-accent'],
    ['bg-[var(--background)]', 'bg-background'],
    ['h-[76px]', 'h-19']
];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    replacements.forEach(([search, replace]) => {
        if (content.includes(search)) {
            content = content.split(search).join(replace);
            modified = true;
        }
    });
    if (modified) {
        fs.writeFileSync(file, content, 'utf8');
    }
});
