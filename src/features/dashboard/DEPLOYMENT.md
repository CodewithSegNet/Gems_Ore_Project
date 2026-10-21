# Deployment Guide

This guide covers deploying the Gems Ore Admin Dashboard to production.

## Pre-Deployment Checklist

### 1. Environment Configuration

- [ ] Create production environment file (`.env.production`)
- [ ] Set all required environment variables
- [ ] Remove or obfuscate demo credentials
- [ ] Configure production API endpoints
- [ ] Set up proper CORS configuration

### 2. Security

- [ ] Enable HTTPS/SSL certificates
- [ ] Configure Content Security Policy (CSP) headers
- [ ] Set up security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- [ ] Implement rate limiting
- [ ] Remove all console.logs in production build
- [ ] Enable secure cookie flags
- [ ] Implement proper authentication backend
- [ ] Set up WAF (Web Application Firewall)

### 3. Performance

- [ ] Enable compression (gzip/brotli)
- [ ] Configure CDN for static assets
- [ ] Set up caching headers
- [ ] Optimize images (WebP, lazy loading)
- [ ] Enable HTTP/2 or HTTP/3
- [ ] Minify all assets

### 4. Monitoring

- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Configure analytics (Google Analytics)
- [ ] Set up uptime monitoring
- [ ] Configure performance monitoring
- [ ] Set up logging infrastructure
- [ ] Configure alerts and notifications

## Build Process

### 1. Install Dependencies

```bash
npm install --production=false
```

### 2. Run Type Check

```bash
npm run type-check
```

### 3. Build for Production

```bash
npm run build
```

This will:
- Compile TypeScript to JavaScript
- Bundle and minify all assets
- Generate optimized chunks
- Create production-ready build in `/dist`

### 4. Test Production Build Locally

```bash
npm run preview
```

Access at `http://localhost:4173` to verify the production build works correctly.

## Deployment Options

### Option 1: Vercel (Recommended)

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2: Login to Vercel**
```bash
vercel login
```

**Step 3: Deploy**
```bash
vercel --prod
```

**Environment Variables:**
Configure in Vercel Dashboard > Project > Settings > Environment Variables

**Build Configuration:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

### Option 2: Netlify

**Step 1: Install Netlify CLI**
```bash
npm install -g netlify-cli
```

**Step 2: Login**
```bash
netlify login
```

**Step 3: Build and Deploy**
```bash
npm run build
netlify deploy --prod --dir=dist
```

**netlify.toml Configuration:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### Option 3: AWS S3 + CloudFront

**Step 1: Build the application**
```bash
npm run build
```

**Step 2: Create S3 Bucket**
```bash
aws s3 mb s3://gemsore-admin-dashboard
```

**Step 3: Upload Build**
```bash
aws s3 sync dist/ s3://gemsore-admin-dashboard --delete
```

**Step 4: Configure CloudFront**
- Create CloudFront distribution
- Point to S3 bucket
- Configure custom domain
- Set up SSL certificate (AWS Certificate Manager)

**Step 5: Set Bucket Policy**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::gemsore-admin-dashboard/*"
    }
  ]
}
```

### Option 4: Docker Container

**Dockerfile:**
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Build and Run:**
```bash
# Build image
docker build -t gemsore-admin:latest .

# Run container
docker run -d -p 80:80 --name gemsore-admin gemsore-admin:latest

# Or use docker-compose
docker-compose up -d
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
```

### Option 5: Traditional Server (VPS/Dedicated)

**Step 1: Install Node.js and nginx**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install nginx
sudo apt-get install nginx
```

**Step 2: Build and Deploy**
```bash
# Clone repository
git clone <repository-url> /var/www/gemsore-admin
cd /var/www/gemsore-admin

# Install dependencies
npm install

# Build
npm run build

# Copy build to nginx directory
sudo cp -r dist/* /var/www/html/
```

**Step 3: Configure nginx**
```bash
sudo nano /etc/nginx/sites-available/gemsore-admin
```

```nginx
server {
    listen 80;
    server_name admin.gemsore.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Step 4: Enable site and restart nginx**
```bash
sudo ln -s /etc/nginx/sites-available/gemsore-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL/TLS Configuration

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d admin.gemsore.com

# Auto-renewal (already configured by certbot)
sudo certbot renew --dry-run
```

## Post-Deployment

### 1. Verify Deployment

- [ ] Check all pages load correctly
- [ ] Test authentication flow
- [ ] Verify API connections
- [ ] Test CRUD operations
- [ ] Check responsive design on different devices
- [ ] Verify SSL/HTTPS is working
- [ ] Test error handling
- [ ] Verify analytics tracking
- [ ] Check security headers

### 2. Performance Testing

```bash
# Run Lighthouse audit
npx lighthouse https://admin.gemsore.com --view

# Test load time
curl -w "@curl-format.txt" -o /dev/null -s https://admin.gemsore.com
```

**curl-format.txt:**
```
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
   time_pretransfer:  %{time_pretransfer}\n
      time_redirect:  %{time_redirect}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
```

### 3. Monitoring Setup

**Set up health checks:**
```bash
# Create health check endpoint
curl https://admin.gemsore.com/

# Set up cron job for monitoring
*/5 * * * * curl -f https://admin.gemsore.com/ || echo "Site down" | mail -s "Alert" admin@gemsore.com
```

### 4. Backup Strategy

- [ ] Set up automated backups
- [ ] Configure backup retention policy
- [ ] Test backup restoration
- [ ] Document backup procedures

## Environment Variables Reference

**Required in Production:**
```bash
VITE_APP_ENV=production
VITE_APP_NAME="Gems Ore Admin Dashboard"
VITE_API_URL=https://api.gemsore.com
VITE_USD_TO_NGN_RATE=1500
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_key
```

**Optional:**
```bash
VITE_SENTRY_DSN=your_sentry_dsn
VITE_GA_TRACKING_ID=your_ga_id
VITE_LOG_LEVEL=error
```

## Rollback Strategy

### Quick Rollback

**Vercel/Netlify:**
- Use deployment history in dashboard
- Click "Rollback" on previous deployment

**Docker:**
```bash
# Tag previous working version
docker tag gemsore-admin:latest gemsore-admin:backup

# Rollback
docker stop gemsore-admin
docker rm gemsore-admin
docker run -d -p 80:80 --name gemsore-admin gemsore-admin:backup
```

**Git-based:**
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Redeploy
npm run build
# ... deploy steps
```

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Loading

```bash
# Check .env file exists
ls -la .env*

# Verify variables are prefixed with VITE_
grep VITE_ .env.production

# Rebuild to include new variables
npm run build
```

### Routing Issues (404 on refresh)

Configure server to redirect all routes to index.html (see nginx config above).

### Performance Issues

- Enable compression (gzip/brotli)
- Set up CDN
- Optimize images
- Enable caching headers
- Use HTTP/2

## Security Headers

Add to nginx/server configuration:

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" always;
```

## Continuous Deployment

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Type check
        run: npm run type-check
        
      - name: Build
        run: npm run build
        env:
          VITE_APP_ENV: production
          VITE_API_URL: ${{ secrets.API_URL }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Support

For deployment issues, contact the development team or refer to the platform-specific documentation.
