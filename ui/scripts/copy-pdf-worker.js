const fs = require('fs');
const path = require('path');

function copyWorker() {
    const projectRoot = path.resolve(__dirname, '..');
    const src = path.join(projectRoot, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.js');
    const destDir = path.join(projectRoot, 'public', 'libs', 'pdfjs');
    const dest = path.join(destDir, 'pdf.worker.min.js');

    if (!fs.existsSync(src)) {
        console.error('pdf.worker.min.js not found in node_modules. Please run `npm install` in the ui folder first.');
        process.exitCode = 2;
        return;
    }

    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, dest);
    console.log('Copied pdf.worker.min.js to', dest);
}

copyWorker();
