export function attachPortConflictHandler(server, port, logger = console, onFatal = (code) => process.exit(code)) {
  server.on('error', (error) => {
    if (error?.code === 'EADDRINUSE') {
      logger.error(`[FATAL] Cổng ${port} đang được sử dụng. Hãy tắt tiến trình khác hoặc đổi APP_PORT.`);
      logger.error(`[FATAL] Chi tiết: ${error.code} - ${error.message}`);
      onFatal(1);
      return;
    }

    logger.error('[FATAL] Server startup failed:', error);
    onFatal(1);
  });
}
