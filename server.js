const app = require('./app');
const http = require('http');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const port = process.env.PORT || 3000;
app.set('port', port);

const server = http.createServer(app);

server.listen(port);
server.on('error', (error) => {
    if (error.syscall !== 'listen') throw error;
    console.error(`Port ${port} is already in use`);
    process.exit(1);
});
server.on('listening', () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Swagger documentation: http://localhost:${port}/api-docs`);
});
