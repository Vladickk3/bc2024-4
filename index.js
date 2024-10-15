const http = require('http');
const { Command } = require('commander');

const program = new Command();

// Визначте параметри командного рядка
program
    .requiredOption('-h, --host <host>', 'адреса сервера')
    .requiredOption('-p, --port <port>', 'порт сервера')
    .requiredOption('-c, --cache <cache>', 'шлях до директорії, яка міститиме закешовані файли');

program.parse(process.argv);

// Отримайте значення параметрів
const options = program.opts();
const { host, port, cache } = options;

// Перевірте, чи всі обовʼязкові параметри задані
if (!host || !port || !cache) {
    console.error('Помилка: усі обовʼязкові параметри повинні бути задані.');
    process.exit(1);
}

// Запустіть веб-сервер
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Веб-сервер працює!');
});

// Слухайте на зазначеному хості та порту
server.listen(port, host, () => {
    console.log(`Сервер запущений на http://${host}:${port}/`);
});

