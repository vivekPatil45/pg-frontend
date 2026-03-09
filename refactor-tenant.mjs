import fs from 'fs';
import path from 'path';

const TARGET_DIR = path.join(process.cwd(), 'src/app/features/tenant');

const REPLACE_MAP = {
    'Customer': 'Tenant',
    'customer': 'tenant',
    'CUSTOMER': 'USER', // UserRole enum
    'Reservation': 'Booking',
    'reservation': 'booking',
    'RESERVATION': 'BOOKING',
    'Bill': 'Payment',
    'bill': 'payment',
    'BILL': 'PAYMENT',
    'ROOM_ISSUE': 'ROOM_ISSUE', // just to ensure standard replacement logic
};

function exploreAndReplace(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            exploreAndReplace(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.html') || fullPath.endsWith('.scss')) {
            let content = fs.readFileSync(fullPath, 'utf-8');
            let modified = false;

            for (const [key, value] of Object.entries(REPLACE_MAP)) {
                // simple global replace, hopefully safe enough for these specific model/component keywords
                const regex = new RegExp(key, 'g');
                if (regex.test(content)) {
                    content = content.replace(regex, value);
                    modified = true;
                }
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf-8');
                console.log(`Updated content: ${fullPath}`);
            }

            // Rename file if necessary
            let newFileName = file;
            for (const [key, value] of Object.entries(REPLACE_MAP)) {
                if (newFileName.includes(key)) {
                    newFileName = newFileName.replace(new RegExp(key, 'g'), value);
                }
            }

            if (newFileName !== file) {
                const newPath = path.join(dir, newFileName);
                fs.renameSync(fullPath, newPath);
                console.log(`Renamed file: ${file} -> ${newFileName}`);
            }
        }
    }
}

exploreAndReplace(TARGET_DIR);
console.log('Refactoring complete.');
