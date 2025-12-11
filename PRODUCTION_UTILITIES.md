# 🏭 Production Utilities Documentation

**Complete Production-Grade Monitoring & Logging System**

---

## 📦 Utilities Created

### 1. **Logger** (`utils/logger.ts`)
Centralized logging with error tracking integration.

**Features**:
- ✅ Multiple log levels (ERROR, WARN, INFO, DEBUG)
- ✅ Automatic user tracking
- ✅ Stack trace capture
- ✅ Memory-efficient (keeps last 1000 logs)
- ✅ Error tracking service integration
- ✅ Development vs Production modes

**Usage**:
```typescript
import { logError, logWarn, logInfo, logDebug } from '@/utils';

// Log an error
logError('Failed to load data', error, { userId: '123' });

// Log a warning
logWarn('Slow API response', { endpoint: '/api/users', duration: 3000 });

// Log info
logInfo('User logged in', { userId: '123', role: 'student' });

// Debug (development only)
logDebug('State updated', { newState });
```

**Production Integration**:
Set `REACT_APP_ERROR_TRACKING_URL` to send errors to your service (Sentry, LogRocket, etc.)

---

### 2. **Analytics** (`utils/analytics.ts`)
Comprehensive event tracking system.

**Features**:
- ✅ Page view tracking
- ✅ Custom event tracking
- ✅ User identification
- ✅ Gamification events
- ✅ Form submissions
- ✅ Button clicks
- ✅ Error tracking

**Usage**:
```typescript
import { analytics, trackPageView, trackEvent, trackLogin } from '@/utils';

// Track page view
trackPageView('/dashboard');

// Track custom event
trackEvent('button_click', 'Interaction', { button: 'submit' });

// Track login
trackLogin(userId, 'student');

// Track achievement
analytics.trackAchievement('ach_123', 'First Steps');

// Track level up
analytics.trackLevelUp(5);
```

**Integration**:
- **Google Analytics**: Set `REACT_APP_GA_TRACKING_ID`
- **Mixpanel**: Set `REACT_APP_MIXPANEL_TOKEN`
- **Custom**: Set `REACT_APP_ANALYTICS_ENDPOINT`
- **Enable**: Set `REACT_APP_ANALYTICS_ENABLED=true`

---

### 3. **Performance Monitor** (`utils/performance.ts`)
Track performance metrics and Core Web Vitals.

**Features**:
- ✅ Function timing
- ✅ API call tracking
- ✅ Component render tracking
- ✅ Core Web Vitals (FCP, LCP, TTFB)
- ✅ Memory usage monitoring
- ✅ Performance reports

**Usage**:
```typescript
import { perfMonitor, timeAsync, trackAPI, markPerf, measurePerf } from '@/utils';

// Time an async function
const data = await timeAsync('fetchUsers', async () => {
  return await userService.getUsers();
});

// Track API call
trackAPI('/api/users', 250, 200); // endpoint, duration, status

// Mark and measure
markPerf('render-start');
// ... render logic
markPerf('render-end');
measurePerf('component-render', 'render-start', 'render-end');

// Get Core Web Vitals
const vitals = perfMonitor.getCoreWebVitals();
console.log('LCP:', vitals.LCP);

// Generate report
const report = perfMonitor.generateReport();
console.log('Slow operations:', report.slowOperations);
```

**Alerts**:
- Functions >1000ms trigger warnings
- API calls >2000ms trigger warnings
- Renders >16ms trigger warnings (60fps threshold)

---

### 4. **Health Check** (`utils/healthCheck.ts`)
System health monitoring.

**Features**:
- ✅ Database connectivity check
- ✅ Authentication status
- ✅ Memory usage monitoring
- ✅ Environment validation
- ✅ Overall health status

**Usage**:
```typescript
import { healthCheck } from '@/utils';

// Full health check
const status = await healthCheck.check();
console.log('Overall:', status.status); // 'healthy' | 'degraded' | 'unhealthy'
console.log('Database:', status.checks.database.status);
console.log('Uptime:', status.uptime);

// Quick check
const isHealthy = await healthCheck.quickCheck();
```

**Health Endpoint**:
Create a route at `/health` that returns the health check data:
```typescript
app.get('/health', async (req, res) => {
  const status = await healthCheck.check();
  res.status(status.status === 'healthy' ? 200 : 503).json(status);
});
```

---

## 🔧 Environment Variables

Add to your `.env` file:

```bash
# Analytics
REACT_APP_ANALYTICS_ENABLED=true
REACT_APP_GA_TRACKING_ID=G-XXXXXXXXXX
REACT_APP_MIXPANEL_TOKEN=your_token_here
REACT_APP_ANALYTICS_ENDPOINT=https://your-analytics-endpoint.com/events

# Error Tracking
REACT_APP_ERROR_TRACKING_URL=https://your-error-tracker.com/api/errors

# Performance Monitoring
REACT_APP_PERFORMANCE_MONITORING_URL=https://your-perf-monitor.com/api/metrics

# App Version
REACT_APP_VERSION=1.0.0
```

---

## 🚀 Integration in App

### Update ErrorBoundary

```typescript
import { logError } from '@/utils';

export class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error
    logError('React Error Boundary', error, {
      componentStack: errorInfo.componentStack
    });
  }
}
```

### Track Page Views in Router

```typescript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/utils';

function App() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  return <Routes>...</Routes>;
}
```

### Track Auth Events

```typescript
// In AuthContext or login function
import { trackLogin, trackLogout, identifyUser } from '@/utils';

const login = async (email, password) => {
  const user = await authService.login(email, password);
  
  // Track login
  trackLogin(user.id, user.role);
  
  // Identify user
  identifyUser(user.id, {
    email: user.email,
    name: user.name,
    role: user.role
  });
};

const logout = () => {
  trackLogout();
  authService.logout();
};
```

---

## 📊 Monitoring Dashboard (Optional)

Create an admin page to view metrics:

```typescript
import { logger, perfMonitor, healthCheck } from '@/utils';

function MonitoringDashboard() {
  const [health, setHealth] = useState(null);
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // Load health
    healthCheck.check().then(setHealth);
    
    // Load logs
    setLogs(logger.getRecentLogs(50));
    
    // Load performance report
    setMetrics(perfMonitor.generateReport());
  }, []);

  return (
    <div>
      <h1>System Monitoring</h1>
      
      {/* Health Status */}
      <div>Status: {health?.status}</div>
      
      {/* Recent Errors */}
      <div>
        {logs.filter(l => l.level === 'error').map(log => (
          <div key={log.timestamp}>{log.message}</div>
        ))}
      </div>
      
      {/* Performance Metrics */}
      <div>
        <div>Slow Operations: {metrics?.slowOperations.length}</div>
        <div>Core Web Vitals: LCP {metrics?.webVitals.LCP}ms</div>
      </div>
    </div>
  );
}
```

---

## ✅ Production Checklist

- [ ] Set all environment variables
- [ ] Test error logging
- [ ] Verify analytics tracking
- [ ] Monitor performance metrics
- [ ] Set up health check endpoint
- [ ] Configure external services (Sentry, GA, etc.)

---

**All utilities are production-ready!** 🎉

Your platform now has enterprise-grade monitoring and logging!
