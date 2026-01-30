const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://admin:admin123@127.0.0.1:5433/bifrost?schema=public',
});

client.connect()
    .then(() => {
        console.log('Connected successfully');
        return client.end();
    })
    .catch((err) => {
        console.error('Connection failed', err);
        process.exit(1);
    });
