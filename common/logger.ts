/**
 * 统一的日志工具
 */

// 定义日志级别，用于比较
const levels = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
} as const;

type LogLevelName = keyof typeof levels;

// 从环境变量获取日志级别，默认为 'info'
const getLogLevel = (): LogLevelName => {
  const level = process.env.LOG_LEVEL?.toLowerCase?.();
  if (level && level in levels) {
    return level as LogLevelName;
  }
  return 'info';
};

const currentLevelName = getLogLevel();
const currentLevel = levels[currentLevelName];

const beijingTimeZone = 'Asia/Shanghai';

const pad2 = (n: number) => String(n).padStart(2, '0');
const pad3 = (n: number) => String(n).padStart(3, '0');

const getTimestamp = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: beijingTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .formatToParts(new Date())
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type !== 'literal') acc[p.type] = p.value;
      return acc;
    }, {});

  const ms = pad3(new Date().getMilliseconds());

  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}.${ms}`;
};

/**
 * 创建一个带上下文的 logger 实例
 * @param context - 日志上下文，例如用例名或模块名
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

// 默认导出一个不带上下文的 logger
export const logger = createLogger();

// 也导出创建函数，以便在需要时创建带上下文的 logger
export default createLogger;
