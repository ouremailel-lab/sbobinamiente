const https = require('https');

const url = 'https://www.sbobinamente.it/index.html';

https.get(url, (res) => {
  if (res.statusCode === 200) {
    console.log('Il sito è ONLINE!');
  } else {
    console.log(`Il sito risponde ma con status: ${res.statusCode}`);
  }
}).on('error', (e) => {
  console.log('Il sito NON è raggiungibile:', e.message);
});
