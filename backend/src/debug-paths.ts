import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- PATH DEBUG START ---');
console.log('Current __dirname:', __dirname);
console.log('Current cwd:', process.cwd());

const uploadsPath = path.resolve(__dirname, '../uploads');
console.log('Resolved uploadsPath:', uploadsPath);

const exists = fs.existsSync(uploadsPath);
console.log('Does uploadsPath exist?', exists);

if (exists) {
    console.log('Contents of uploadsPath:');
    try {
        const files = fs.readdirSync(uploadsPath);
        console.log(files);

        // Deep check for the specific file
        const deepPath = path.join(uploadsPath, 'images', 'profile-photos');
        if (fs.existsSync(deepPath)) {
            console.log('Contents of images/profile-photos:');
            console.log(fs.readdirSync(deepPath));
        } else {
            console.log('images/profile-photos does not exist');
        }

    } catch (e) {
        console.error('Error reading dir:', e);
    }
}
console.log('--- PATH DEBUG END ---');
