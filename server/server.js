const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const convertRouter = require('./routes/convert');

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure output directory exists
const OUTPUT_DIR = path.join(__dirname, 'output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve converted files
app.use('/files', express.static(OUTPUT_DIR));

// API routes
app.use('/api', convertRouter);

// Health check
app.get('/health', (req, res) => res.json({ ok: true, version: '1.0.0' }));

app.listen(PORT, () => {
  console.log(`\n🎵 PocketTune Server running on http://localhost:${PORT}`);
  console.log(`   Output directory: ${OUTPUT_DIR}\n`);
});

module.exports = app;
