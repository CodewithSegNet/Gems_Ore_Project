# Security Guide

This document outlines security best practices and measures implemented in the Gems Ore Admin Dashboard.

## 🔒 Security Measures Implemented

### 1. Input Validation & Sanitization

**Location:** `/src/app/utils/security.ts`

- ✅ HTML sanitization to prevent XSS
- ✅ URL validation and sanitization
- ✅ Email format validation
- ✅ File upload validation (type, size, extension)
- ✅ SQL injection pattern detection
- ✅ Special character filtering

**Usage:**
```typescript
import { sanitizeHtml, validateInput, validateFileUpload } from './utils/security';

// Sanitize user input
const clean = sanitizeHtml(userInput);

// Validate input
const { valid, error } = validateInput(userInput, {
  maxLength: 500,
  allowHtml: false,
});

// Validate file upload
const { valid, error } = validateFileUpload(file, {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png'],
});
```

### 2. Authentication & Authorization

**Current Implementation:** Demo mode (localStorage-based)

⚠️ **IMPORTANT:** Replace with proper backend authentication before production.

**Required for Production:**

1. **Backend Authentication**
   ```typescript
   // Replace in /src/app/utils/auth.ts
   export async function login(email: string, password: string) {
     const response = await fetch('/api/auth/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email, password }),
     });
     
     const { token } = await response.json();
     
     // Store secure HTTP-only cookie
     // or use secure token storage
   }
   ```

2. **JWT Tokens**
   - Use short-lived access tokens (15 minutes)
   - Implement refresh tokens
   - Store tokens securely (HTTP-only cookies)

3. **Session Management**
   - Implement session timeout (1 hour)
   - Refresh on activity
   - Secure logout

### 3. Rate Limiting

**Location:** `/src/app/utils/security.ts`

```typescript
import { RateLimiter } from './utils/security';

const loginLimiter = new RateLimiter(5, 60000); // 5 attempts per minute

if (!loginLimiter.isAllowed(userEmail)) {
  throw new Error('Too many login attempts. Please try again later.');
}
```

**Backend Rate Limiting (Required):**
- Login: 5 attempts per 15 minutes
- API calls: 100 requests per minute
- File uploads: 10 per hour

### 4. Password Security

**Current Implementation:**
```typescript
import { validatePasswordStrength, hashString } from './utils/security';

const { isStrong, feedback } = validatePasswordStrength(password);

if (!isStrong) {
  console.log('Password requirements:', feedback);
}

// Hash password before sending to backend
const hashedPassword = await hashString(password);
```

**Production Requirements:**
- Minimum 8 characters
- Include uppercase, lowercase, numbers, special characters
- Hash with bcrypt/Argon2 on backend
- Salt with unique per-user salts
- Never store plain text passwords

### 5. HTTPS/SSL

**Required for Production:**
```bash
# Using Let's Encrypt
sudo certbot --nginx -d admin.gemsore.com
```

**Force HTTPS:**
```nginx
# nginx configuration
server {
    listen 80;
    server_name admin.gemsore.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.gemsore.com;
    
    ssl_certificate /etc/letsencrypt/live/admin.gemsore.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.gemsore.com/privkey.pem;
    
    # Strong SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
}
```

### 6. Security Headers

**Implementation:** Add to nginx/server configuration

```nginx
# Prevent clickjacking
add_header X-Frame-Options "SAMEORIGIN" always;

# Prevent MIME type sniffing
add_header X-Content-Type-Options "nosniff" always;

# XSS Protection
add_header X-XSS-Protection "1; mode=block" always;

# HSTS (Force HTTPS)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Referrer Policy
add_header Referrer-Policy "no-referrer-when-downgrade" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.gemsore.com;" always;

# Permissions Policy
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

### 7. CORS Configuration

**Backend Configuration (Example):**
```typescript
// Express.js example
app.use(cors({
  origin: ['https://admin.gemsore.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### 8. Data Protection

#### Sensitive Data Handling

```typescript
import { sanitizeForLogging } from './utils/security';

// Remove sensitive data before logging
const safeData = sanitizeForLogging(userData, [
  'password',
  'token',
  'apiKey',
  'creditCard',
]);

logger.info('User data', safeData);
```

#### LocalStorage Security

⚠️ **Never store sensitive data in localStorage**

- No passwords
- No API keys
- No credit card information
- No personal identifiable information (PII)

For production:
- Use HTTP-only cookies for auth tokens
- Encrypt sensitive data before storage
- Implement data retention policies

### 9. File Upload Security

**Current Implementation:**
```typescript
import { validateFileUpload } from './utils/security';

const { valid, error } = validateFileUpload(file, {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
});
```

**Additional Backend Validation:**
- Verify file content (not just extension)
- Scan for malware
- Store files outside web root
- Generate random filenames
- Implement file size limits
- Restrict file types

### 10. API Security

**Token Management:**
```typescript
// Include auth token in requests
const token = localStorage.getItem('authToken');

fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

**Backend Requirements:**
- Validate all inputs
- Implement request signing
- Use API versioning
- Log all sensitive operations
- Implement rate limiting
- Validate content types

## 🚨 Security Vulnerabilities to Address

### Critical (Fix Before Production)

1. **Authentication System**
   - [ ] Replace demo auth with secure backend
   - [ ] Implement proper token management
   - [ ] Add session management
   - [ ] Implement 2FA (recommended)

2. **HTTPS**
   - [ ] Enable SSL/TLS certificates
   - [ ] Force HTTPS redirects
   - [ ] Configure HSTS

3. **Environment Variables**
   - [ ] Remove hardcoded secrets
   - [ ] Secure API keys
   - [ ] Use secret management service

### High Priority

4. **Backend Validation**
   - [ ] Validate all inputs on backend
   - [ ] Implement SQL injection prevention
   - [ ] Add XSS protection on backend

5. **Rate Limiting**
   - [ ] Implement on API endpoints
   - [ ] Configure per-endpoint limits
   - [ ] Add IP-based throttling

6. **Security Headers**
   - [ ] Configure CSP properly
   - [ ] Add all recommended headers
   - [ ] Test header configuration

### Medium Priority

7. **Logging & Monitoring**
   - [ ] Implement audit logging
   - [ ] Set up security monitoring
   - [ ] Configure alerts

8. **Data Encryption**
   - [ ] Encrypt sensitive data at rest
   - [ ] Use TLS for data in transit
   - [ ] Implement field-level encryption

## 🔍 Security Testing

### Automated Testing

```bash
# Install security testing tools
npm install --save-dev eslint-plugin-security

# Run security audit
npm audit

# Fix vulnerabilities
npm audit fix
```

### Manual Testing Checklist

- [ ] SQL injection testing
- [ ] XSS testing (reflected, stored, DOM-based)
- [ ] CSRF testing
- [ ] Authentication bypass attempts
- [ ] Authorization bypass attempts
- [ ] File upload vulnerabilities
- [ ] Session management issues
- [ ] Information disclosure
- [ ] Business logic flaws

### Penetration Testing

Recommended before production:
- [ ] OWASP Top 10 testing
- [ ] Vulnerability scanning
- [ ] Penetration testing by security firm
- [ ] Code security review

## 📋 Security Incident Response

### Incident Response Plan

1. **Detection**
   - Monitor error logs
   - Set up security alerts
   - Review access logs regularly

2. **Response**
   - Isolate affected systems
   - Assess impact
   - Contain the breach
   - Notify stakeholders

3. **Recovery**
   - Fix vulnerabilities
   - Restore from backups
   - Verify system integrity

4. **Post-Incident**
   - Document incident
   - Update security measures
   - Conduct retrospective

### Security Contacts

- **Security Team:** security@gemsore.com
- **Emergency Contact:** [Phone Number]
- **Incident Reporting:** [Reporting URL]

## 🔐 Best Practices

### Development

1. **Code Review**
   - Review all code for security issues
   - Use security linters
   - Follow secure coding guidelines

2. **Dependencies**
   - Keep dependencies updated
   - Review dependency security advisories
   - Use `npm audit` regularly

3. **Secrets Management**
   - Never commit secrets to git
   - Use environment variables
   - Rotate secrets regularly
   - Use secrets management service (AWS Secrets Manager, etc.)

### Deployment

1. **Secure Deployment**
   - Use CI/CD with security checks
   - Implement deployment approvals
   - Test in staging first

2. **Monitoring**
   - Monitor for suspicious activity
   - Set up alerts for security events
   - Review logs regularly

3. **Updates**
   - Keep all software updated
   - Apply security patches promptly
   - Have rollback plan ready

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Mozilla Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
- [Google Web Fundamentals Security](https://developers.google.com/web/fundamentals/security)

## 🤝 Responsible Disclosure

If you discover a security vulnerability, please email security@gemsore.com with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

**Please do not:**
- Publicly disclose before we've had a chance to fix
- Access or modify user data
- Perform destructive tests

We appreciate responsible disclosure and will acknowledge your contribution.

---

**Last Updated:** March 6, 2026

**Next Security Review:** [Schedule regular reviews]
