export const API_TIMEOUT_MS = 180000; // 3 minutes

export const FILE_UPLOAD_DEFAULTS = {
  maxFiles: 3,
  maxFileSizeBytes: 8 * 1024 * 1024, // 8MB
  maxTotalSizeBytes: 24 * 1024 * 1024, // 24MB
};

export const STATUS_POLL_INTERVAL_MS = {
  connected: 10000,
  down: 30000,
};


