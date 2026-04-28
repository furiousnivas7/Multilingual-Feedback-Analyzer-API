const levels = { error: 0, warn: 1, info: 2, debug: 3 } as const;
type Level = keyof typeof levels;

const configured = levels[(process.env.LOG_LEVEL as Level) ?? 'info'] ?? 2;

export const logger = {
  info:  (fn: string, msg: string, ...args: unknown[]) => { if (levels.info  <= configured) console.log (`[${fn}] -> ${msg}`, ...args); },
  debug: (fn: string, msg: string, ...args: unknown[]) => { if (levels.debug <= configured) console.log (`[${fn}] -> ${msg}`, ...args); },
  warn:  (fn: string, msg: string, ...args: unknown[]) => { if (levels.warn  <= configured) console.warn(`[${fn}] -> ${msg}`, ...args); },
  error: (fn: string, msg: string, ...args: unknown[]) => { if (levels.error <= configured) console.error(`[${fn}] -> ${msg}`, ...args); },
};
