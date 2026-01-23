/**
 * 统一日志工具，通过 `LOG_LEVEL` 环境变量控制级别。
 * 时间戳固定为北京时间 `YYYY-MM-DD HH:mm:ss.SSS` 格式。
 */

/** 日志级别数值映射，用于阈值比较 */
const levels = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
} as const;

type LogLevelName = keyof typeof levels;

/** 从 `LOG_LEVEL` 环境变量获取级别，默认为 'info' */
const getLogLevel = (): LogLevelName => {
  const level = process.env.LOG_LEVEL?.toLowerCase?.();
  if (level && level in levels) {
    return level as LogLevelName;
  }
  return 'info';
};

/** 当前生效的日志级别名 */
const currentLevelName = getLogLevel();

/** 当前生效的日志级别阈值 */
const currentLevel = levels[currentLevelName];

const shanghaiTimeZone = 'Asia/Shanghai';

const pad3 = (n: number) => String(n).padStart(3, '0');

/** 获取北京时间的时间戳字符串 */
const getTimestamp = () => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: shanghaiTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .formatToParts(now)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type !== 'literal') acc[p.type] = p.value;
      return acc;
    }, {});

  const ms = pad3(now.getMilliseconds());

  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}.${ms}`;
};

/**
 * 创建带可选上下文的 logger 实例。
 * @param context 上下文，如 'module:platform'
 */
const createLogger = (context?: string) => {
  const prefix = context ? `[${context}]` : '';

  const log = (level: LogLevelName, ...args: unknown[]) => {
    if (levels[level] <= currentLevel) {
      const levelTag = `[${level.toUpperCase()}]`.padEnd(7, ' ');
      const logFunc = console[level] || console.log;
      logFunc(`[${getTimestamp()}] ${levelTag}${prefix}`, ...args);
    }
  };

  return {
    debug: (...args: unknown[]) => log('debug', ...args),
    info: (...args: unknown[]) => log('info', ...args),
    warn: (...args: unknown[]) => log('warn', ...args),
    error: (...args: unknown[]) => log('error', ...args),
  };
};

/** 默认导出的 logger 实例（不带上下文） */
export const logger = createLogger();

/** 用于创建带上下文 logger 的工厂函数 */
export default createLogger;
