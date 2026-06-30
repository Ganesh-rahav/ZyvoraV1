/**
 * Structured application logger for Zyvora.
 * Matches the logging specification in docs/03-system-architecture.md §5.5.
 *
 * In production, this would ship logs to a centralized aggregation service.
 * In development, it outputs formatted console logs.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  requestId?: string
  userId?: string
  operation?: string
  durationMs?: number
  status?: string
  message: string
  error?: string
  meta?: Record<string, unknown>
}

function createLogEntry(
  level: LogLevel,
  message: string,
  meta?: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'message'>>
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  }
}

function emit(entry: LogEntry): void {
  if (process.env.NODE_ENV === 'production') {
    // In production: emit JSON to stdout for log aggregation
    // PII scrubbing occurs at the aggregation layer
    console.log(JSON.stringify(entry))
  } else {
    // In development: human-readable output
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`
    const meta = entry.operation ? ` ${entry.operation}` : ''
    const duration = entry.durationMs ? ` (${entry.durationMs}ms)` : ''
    console[entry.level === 'error' ? 'error' : entry.level === 'warn' ? 'warn' : 'log'](
      `${prefix}${meta}${duration}: ${entry.message}`,
      entry.meta ?? ''
    )
  }
}

export const logger = {
  debug: (message: string, meta?: Partial<LogEntry>) => {
    if (process.env.NODE_ENV === 'development') {
      emit(createLogEntry('debug', message, meta))
    }
  },

  info: (message: string, meta?: Partial<LogEntry>) => {
    emit(createLogEntry('info', message, meta))
  },

  warn: (message: string, meta?: Partial<LogEntry>) => {
    emit(createLogEntry('warn', message, meta))
  },

  error: (message: string, error?: unknown, meta?: Partial<LogEntry>) => {
    const errorMessage = error instanceof Error ? error.message : String(error)
    emit(createLogEntry('error', message, { ...meta, error: errorMessage }))
  },
}
