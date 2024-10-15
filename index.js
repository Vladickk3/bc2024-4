const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const { Command } = require('commander');
const superagent = require('superagent');

const program = new Command();
program
    .option('-h, --host <host>', 'адреса сервера', '127.0.0.1')
    .option('-p, --port <port>', 'порт сервера', '3000')
    .option('-c, --cache <cache>', 'шлях до директорії з закешованими файлами', './cache');

program.parse(process.argv);
const options = program.opts();

// Створіть директорію кешу, якщо вона не існує
fs.mkdir(options.cache, { recursive: true });

const server = http.createServer(async (req, res) => {
    console.log(`Запит: ${req.method} ${req.url}`); // Логування запиту
    const urlParts = req.url.split('/');
    const statusCode = urlParts[1]; // Отримуємо код статусу з URL
    const filePath = path.join(options.cache, `${statusCode}.jpg`);

    switch (req.method) {
        case 'GET':
            try {
                const data = await fs.readFile(filePath);
                res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                res.end(data);
            } catch (err) {
                console.log(`Файл не знайдено в кеші. Спробую отримати з http.cat...`);

                try {
                    const response = await superagent.get(`https://http.cat/${statusCode}`);
                    console.log(`Отримано зображення з http.cat для статусу: ${statusCode}`);
                    await fs.writeFile(filePath, response.body); // Зберігаємо картинку в кеш
                    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                    res.end(response.body);
                } catch (catErr) {
                    console.error(`Помилка отримання з http.cat: ${catErr.message}`);
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found');
                }
            }
            break;

        case 'PUT':
            const chunks = [];
            req.on('data', chunk => chunks.push(chunk));
            req.on('end', async () => {
                const imageBuffer = Buffer.concat(chunks);
                await fs.writeFile(filePath, imageBuffer);
                res.writeHead(201, { 'Content-Type': 'text/plain' });
                res.end('Created');
            });
            break;

        case 'DELETE':
            try {
                await fs.unlink(filePath);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Deleted');
            } catch (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
            break;

        default:
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            res.end('Method not allowed');
    }
});

server.listen(options.port, options.host, () => {
    console.log(`Сервер запущено на ${options.host}:${options.port}`);
});
//The End