#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import process from 'process';
import excelCrudImportService from '../src/services/management/excelCrudImport/index.js';

const usage = `Usage:
  node server/scripts/excel-import-test.js generate-template <moduleKey> <outPath>
  node server/scripts/excel-import-test.js generate-export <moduleKey> <outPath>
  node server/scripts/excel-import-test.js preview <moduleKey> <filePath>
  node server/scripts/excel-import-test.js import <moduleKey> <filePath>

Examples:
  node server/scripts/excel-import-test.js generate-template brands ./tmp/brands-template.xlsx
  node server/scripts/excel-import-test.js preview brands ./tmp/brands-template.xlsx
`;

const [, , cmd, moduleKey, filePathArg] = process.argv;
if (!cmd || !moduleKey) {
    console.error(usage);
    process.exit(1);
}

const outPath = filePathArg ? path.resolve(process.cwd(), filePathArg) : null;

(async () => {
    try {
        if (cmd === 'generate-template') {
            if (!outPath) throw new Error('Missing outPath');
            const buffer = await excelCrudImportService.generateTemplate(moduleKey);
            fs.mkdirSync(path.dirname(outPath), { recursive: true });
            fs.writeFileSync(outPath, Buffer.from(await buffer));
            console.log('Template written to', outPath);
            process.exit(0);
        }

        if (cmd === 'generate-export') {
            if (!outPath) throw new Error('Missing outPath');
            const buffer = await excelCrudImportService.generateExport(moduleKey);
            fs.mkdirSync(path.dirname(outPath), { recursive: true });
            fs.writeFileSync(outPath, Buffer.from(await buffer));
            console.log('Export written to', outPath);
            process.exit(0);
        }

        if (cmd === 'preview') {
            if (!outPath) throw new Error('Missing filePath');
            const file = fs.readFileSync(outPath);
            const summary = await excelCrudImportService.previewImport(moduleKey, file);
            console.log(JSON.stringify(summary, null, 2));
            process.exit(0);
        }

        if (cmd === 'import') {
            if (!outPath) throw new Error('Missing filePath');
            const file = fs.readFileSync(outPath);
            const summary = await excelCrudImportService.importFile(moduleKey, file);
            console.log(JSON.stringify(summary, null, 2));
            process.exit(0);
        }

        console.error(usage);
        process.exit(1);
    } catch (err) {
        console.error('Error:', err && err.message ? err.message : err);
        if (err && err.stack) console.error(err.stack);
        process.exit(1);
    }
})();
