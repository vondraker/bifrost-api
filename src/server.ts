import dotenv from 'dotenv';
// Load env vars
dotenv.config();

import app from './app';
import path from 'path';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
