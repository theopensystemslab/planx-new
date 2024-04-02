import pino from 'pino'

const DEFAULT_LOG_LEVEL = 'info'

// set up logging
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { destination: 1 }, // 2 for stderr
  },
  level: process.env.LOG_LEVEL || DEFAULT_LOG_LEVEL,
})

export default logger;
