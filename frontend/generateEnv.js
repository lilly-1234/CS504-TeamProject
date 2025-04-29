const fs = require('fs');
const path = require('path');

const domain = process.env.CODESPACE_NAME
  ? `https://${process.env.CODESPACE_NAME}-5000.app.github.dev`
  : 'http://localhost:5000';

const authApiBackend = `${domain}/api/auth`;



const envContent = `REACT_APP_API_URL=${authApiBackend}`;

fs.writeFileSync(path.join(__dirname, '.env'), envContent, 'utf8');
console.log('.env file has been generated with the following content:');
console.log(envContent);