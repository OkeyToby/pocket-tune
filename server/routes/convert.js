const express = require('express');
const { execFile, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const sanitize = require('sanitize-filename');

const router = express.Router();
const OUTPUT_DIR = path.join(__dirname, '..', 'output');

// Estimated sizes in KB for a 3-minute track (scaled by duration)
const SIZE_PER_MIN = { '128kbps': 960, '320kbps': 2400, lossless: 25000 };

function ytDlpPath() {
  // Try common locations; fall back to PATH
  const candidates = ['yt-dlp', 'yt-dlp.exe'];
  return candidates[0];
}

function parseYtDlpJson(stdout) {
  try {
    return JSON.parse(stdout);
  } catch {
    return null;
  }
}

// GET /api/info?url=<youtube_url>
router.get('/info', (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url is required' });

  const args = [
    '--dump-json',
    '--no-playlist',
    '--no-download',
    url,
  ];

  execFile(ytDlpPath(), args, { timeout: 30000, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
    if (err) {
      console.error('yt-dlp info error:', stderr || err.message);
      return res.status(500).json({
        error: 'Failed to fetch video info. Make sure yt-dlp is installed and the URL is valid.',
        detail: stderr?.slice(0, 500),
      });
    }

    const info = parseYtDlpJson(stdout);
    if (!info) return res.status(500).json({ error: 'Could not parse video info' });

    const durationSecs = Math.round(info.duration ?? 0);
    const durationMins = durationSecs / 60;

    res.json({
      title: info.title ?? 'Unknown',
      channel: info.uploader ?? info.channel ?? 'Unknown',
      durationSecs,
      thumbnailUrl: info.thumbnail ?? null,
      estimatedSizeKb: {
        '128kbps': Math.round(SIZE_PER_MIN['128kbps'] * durationMins),
        '320kbps': Math.round(SIZE_PER_MIN['320kbps'] * durationMins),
        lossless: Math.round(SIZE_PER_MIN.lossless * durationMins),
      },
    });
  });
});

// POST /api/convert
// body: { url, quality: '128kbps'|'320kbps'|'lossless', format: 'mp3'|'flac'|'aac'|'wav' }
router.post('/convert', async (req, res) => {
  const { url, quality = '320kbps', format = 'mp3' } = req.body;
  if (!url) return res.status(400).json({ error: 'url is required' });

  const jobId = uuidv4();
  const outputTemplate = path.join(OUTPUT_DIR, `${jobId}.%(ext)s`);

  // Build yt-dlp arguments based on format/quality
  const args = ['--no-playlist', '-o', outputTemplate];

  if (format === 'mp3') {
    const bitrate = quality === '128kbps' ? '128' : quality === '320kbps' ? '320' : '320';
    args.push('-x', '--audio-format', 'mp3', '--audio-quality', `${bitrate}K`);
  } else if (format === 'flac') {
    args.push('-x', '--audio-format', 'flac');
  } else if (format === 'aac') {
    const bitrate = quality === '128kbps' ? '128K' : '256K';
    args.push('-x', '--audio-format', 'aac', '--audio-quality', bitrate);
  } else if (format === 'wav') {
    args.push('-x', '--audio-format', 'wav');
  }

  args.push(url);

  console.log(`[${jobId}] Starting conversion: ${url} → ${format} (${quality})`);

  const proc = spawn(ytDlpPath(), args);
  let stderr = '';

  proc.stderr.on('data', (data) => {
    stderr += data.toString();
    // Log progress lines
    const line = data.toString().trim();
    if (line.includes('[download]') || line.includes('[ExtractAudio]')) {
      console.log(`[${jobId}]`, line);
    }
  });

  proc.on('close', (code) => {
    if (code !== 0) {
      console.error(`[${jobId}] yt-dlp exited with code ${code}:`, stderr.slice(-500));
      return res.status(500).json({
        error: 'Conversion failed. Make sure yt-dlp and ffmpeg are installed.',
        detail: stderr.slice(-300),
      });
    }

    // Find the output file
    const files = fs.readdirSync(OUTPUT_DIR);
    const outputFile = files.find((f) => f.startsWith(jobId));

    if (!outputFile) {
      return res.status(500).json({ error: 'Output file not found after conversion' });
    }

    const filename = outputFile;
    console.log(`[${jobId}] Done → ${filename}`);

    res.json({
      fileUrl: `/files/${filename}`,
      filename,
      jobId,
    });

    // Auto-cleanup after 10 minutes
    setTimeout(() => {
      const filePath = path.join(OUTPUT_DIR, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[${jobId}] Cleaned up ${filename}`);
      }
    }, 10 * 60 * 1000);
  });

  proc.on('error', (err) => {
    console.error(`[${jobId}] spawn error:`, err.message);
    if (!res.headersSent) {
      res.status(500).json({
        error: `Could not start yt-dlp: ${err.message}. Is it installed and in PATH?`,
      });
    }
  });
});

// GET /api/status/:jobId — basic status check (jobs are sync for now)
router.get('/status/:jobId', (req, res) => {
  const files = fs.readdirSync(OUTPUT_DIR);
  const file = files.find((f) => f.startsWith(req.params.jobId));
  if (file) {
    res.json({ done: true, fileUrl: `/files/${file}` });
  } else {
    res.json({ done: false });
  }
});

module.exports = router;
