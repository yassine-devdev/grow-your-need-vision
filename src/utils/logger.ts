/**
 * Logger Utility
 * Provides structured logging with different levels and destinations
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxLogSize: number;
  batchSize: number;
  flushInterval: number;
}

class Logger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: 'info',
      enableConsole: true,
      enableRemote: false,
      maxLogSize: 1000,
      batchSize: 50,
      flushInterval: 5000,
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.setupFlushTimer();
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private setupFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.flushTimer = setInterval(() => {
        this.flushLogs();
      }, this.config.flushInterval);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    return levels[level] >= levels[this.config.level];
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    component?: string,
    action?: string
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId,
      component,
      action,
    };
  }

  private getCurrentUserId(): string | undefined {
    // Try to get user ID from various sources
    if (typeof window !== 'undefined') {
      // Check Redux store
      const store = (window as any).__REDUX_STORE__;
      if (store?.getState()?.auth?.user?.id) {
        return store.getState().auth.user.id;
      }

      // Check localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user.id;
        } catch {
          // Ignore parsing errors
        }
      }
    }

    return undefined;
  }

  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Remote logging
    if (this.config.enableRemote) {
      this.addToBuffer(entry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const logMethod = {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
    }[entry.level];

    const logMessage = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    const contextInfo = entry.component ? `[${entry.component}]` : '';
    const actionInfo = entry.action ? `[${entry.action}]` : '';
    const userContext = entry.userId ? `[User: ${entry.userId}]` : '';

    logMessage(
      `${logMessage} ${contextInfo}${actionInfo} ${userContext} ${entry.message}`,
      entry.context
    );
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);

    // Trim buffer if it exceeds max size
    if (this.logBuffer.length > this.config.maxLogSize) {
      this.logBuffer = this.logBuffer.slice(-this.config.maxLogSize);
    }

    // Flush if batch size is reached
    if (this.logBuffer.length >= this.config.batchSize) {
      this.flushLogs();
    }
  }

  private async flushLogs(): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint || this.logBuffer.length === 0) {
      return;
    }

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs: logsToSend,
          meta: {
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
            url: typeof window !== 'undefined' ? window.location.href : 'server',
            timestamp: new Date().toISOString(),
          },
        }),
      });
    } catch (error) {
      // Re-add logs to buffer if send fails
      this.logBuffer.unshift(...logsToSend);
      console.error('Failed to send logs to remote endpoint:', error);
    }
  }

  // Public logging methods
  debug(message: string, context?: Record<string, any>, component?: string, action?: string): void {
    const entry = this.createLogEntry('debug', message, context, component, action);
    this.log(entry);
  }

  info(message: string, context?: Record<string, any>, component?: string, action?: string): void {
    const entry = this.createLogEntry('info', message, context, component, action);
    this.log(entry);
  }

  warn(message: string, context?: Record<string, any>, component?: string, action?: string): void {
    const entry = this.createLogEntry('warn', message, context, component, action);
    this.log(entry);
  }

  error(message: string, context?: Record<string, any>, component?: string, action?: string): void {
    const entry = this.createLogEntry('error', message, context, component, action);
    this.log(entry);
  }

  // Performance logging
  time(label: string, component?: string): void {
    const fullLabel = component ? `${component}:${label}` : label;
    console.time(fullLabel);
  }

  timeEnd(label: string, component?: string): void {
    const fullLabel = component ? `${component}:${label}` : label;
    console.timeEnd(fullLabel);
  }

  // Component lifecycle logging
  componentMount(componentName: string, props?: Record<string, any>): void {
    this.debug(`Component mounted: ${componentName}`, { props }, componentName, 'mount');
  }

  componentUnmount(componentName: string): void {
    this.debug(`Component unmounted: ${componentName}`, {}, componentName, 'unmount');
  }

  componentUpdate(componentName: string, prevProps?: Record<string, any>, newProps?: Record<string, any>): void {
    this.debug(`Component updated: ${componentName}`, { prevProps, newProps }, componentName, 'update');
  }

  // API logging
  apiCall(method: string, url: string, data?: any): void {
    this.debug(`API call: ${method} ${url}`, { data }, 'API', method);
  }

  apiResponse(method: string, url: string, status: number, data?: any): void {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    this.log(this.createLogEntry(level, `API response: ${method} ${url} - ${status}`, { data }, 'API', 'response'));
  }

  apiError(method: string, url: string, error: any): void {
    this.error(`API error: ${method} ${url}`, { error }, 'API', 'error');
  }

  // User action logging
  userAction(action: string, context?: Record<string, any>, component?: string): void {
    this.info(`User action: ${action}`, context, component || 'User', action);
  }

  // Error logging with stack trace
  errorWithStack(message: string, error: Error, component?: string, action?: string): void {
    this.error(message, {
      error: error.message,
      stack: error.stack,
      name: error.name,
    }, component, action);
  }

  // Configuration
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.setupFlushTimer();
  }

  // Force flush logs
  async flush(): Promise<void> {
    await this.flushLogs();
  }

  // Get logs from buffer
  getBufferedLogs(): LogEntry[] {
    return [...this.logBuffer];
  }

  // Clear buffer
  clearBuffer(): void {
    this.logBuffer = [];
  }

  // Cleanup
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }
}

// Create default logger instance
const defaultLogger = new Logger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  enableConsole: true,
  enableRemote: process.env.NODE_ENV === 'production',
  remoteEndpoint: process.env.REACT_APP_LOG_ENDPOINT,
});

// Export the default logger
export const logger = defaultLogger;

// Export Logger class for custom instances
export { Logger };

// Convenience exports
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  time: logger.time.bind(logger),
  timeEnd: logger.timeEnd.bind(logger),
  componentMount: logger.componentMount.bind(logger),
  componentUnmount: logger.componentUnmount.bind(logger),
  componentUpdate: logger.componentUpdate.bind(logger),
  apiCall: logger.apiCall.bind(logger),
  apiResponse: logger.apiResponse.bind(logger),
  apiError: logger.apiError.bind(logger),
  userAction: logger.userAction.bind(logger),
  errorWithStack: logger.errorWithStack.bind(logger),
};

// HOC for React component logging
export const withLogging = (WrappedComponent: React.ComponentType<any>, componentName?: string) => {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const LoggedComponent = (props: any) => {
    React.useEffect(() => {
      log.componentMount(displayName, props);
      
      return () => {
        log.componentUnmount(displayName);
      };
    }, []);

    React.useEffect(() => {
      log.componentUpdate(displayName, props, props);
    });

    return <WrappedComponent {...props} />;
  };

  LoggedComponent.displayName = `withLogging(${displayName})`;
  
  return LoggedComponent;
};

export default logger;