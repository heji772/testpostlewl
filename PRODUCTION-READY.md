# 🛡️ PhishGuard Production Deployment Checklist

## 📋 Pre-Production Checklist

### ✅ Security Hardening

- [ ] **SSL Certificates**
  - [ ] Replace self-signed certificates with Let's Encrypt or commercial SSL
  - [ ] Configure automatic certificate renewal
  - [ ] Test SSL configuration with SSL Labs
  - [ ] Enable HSTS with appropriate max-age

- [ ] **Authentication & Authorization**
  - [ ] Change default admin password (use strong 20+ character password)
  - [ ] Enable 2FA/TOTP for admin accounts
  - [ ] Implement session timeout (15-30 minutes)
  - [ ] Set up account lockout after failed login attempts
  - [ ] Review and restrict API endpoint access

- [ ] **Database Security**
  - [ ] Change database password from default
  - [ ] Restrict database network access (internal only)
  - [ ] Enable database encryption at rest
  - [ ] Configure connection pooling limits
  - [ ] Set up read-only database replicas if needed

- [ ] **Secrets Management**
  - [ ] Rotate all secrets (JWT_SECRET, ENCRYPTION_KEY)
  - [ ] Store secrets in secure vault (AWS Secrets Manager, HashiCorp Vault)
  - [ ] Remove .env file from version control
  - [ ] Use environment-specific .env files

- [ ] **Rate Limiting & DDoS Protection**
  - [ ] Configure Nginx rate limiting (already added)
  - [ ] Set up CloudFlare or similar CDN/WAF
  - [ ] Enable connection limits
  - [ ] Configure fail2ban for IP blocking

- [ ] **Input Validation**
  - [ ] Validate all user inputs server-side
  - [ ] Implement SQL injection prevention (parameterized queries)
  - [ ] Add XSS protection headers (already added)
  - [ ] Sanitize user-generated content

### ✅ Infrastructure & DevOps

- [ ] **Docker & Containers**
  - [ ] Use specific image versions (no :latest tags)
  - [ ] Scan images for vulnerabilities (Trivy, Snyk)
  - [ ] Set resource limits (CPU, memory) per container
  - [ ] Use multi-stage builds to reduce image size
  - [ ] Configure container restart policies

- [ ] **Monitoring & Logging**
  - [ ] Set up centralized logging (ELK Stack, Loki, CloudWatch)
  - [ ] Configure log rotation and retention
  - [ ] Set up monitoring dashboards (Grafana, Datadog)
  - [ ] Create alerts for critical errors
  - [ ] Monitor disk space, CPU, memory
  - [ ] Set up uptime monitoring (Pingdom, UptimeRobot)

- [ ] **Backup & Recovery**
  - [ ] Automate daily database backups
  - [ ] Test backup restoration procedure
  - [ ] Store backups off-site (S3, Azure Blob)
  - [ ] Encrypt backup files
  - [ ] Document recovery procedures (RTO/RPO)
  - [ ] Set up backup retention policy (30+ days)

- [ ] **High Availability**
  - [ ] Configure database replication
  - [ ] Set up load balancing (multiple backend instances)
  - [ ] Use orchestration (Kubernetes, Docker Swarm)
  - [ ] Configure health checks for all services
  - [ ] Plan for zero-downtime deployments

### ✅ Compliance & Privacy

- [ ] **GDPR Compliance**
  - [ ] Implement data retention policies
  - [ ] Add user data export functionality
  - [ ] Create data deletion procedures
  - [ ] Update privacy policy
  - [ ] Add cookie consent banner
  - [ ] Implement audit logging

- [ ] **Security Auditing**
  - [ ] Run OWASP ZAP security scan
  - [ ] Perform penetration testing
  - [ ] Review all third-party dependencies
  - [ ] Enable audit logging for admin actions
  - [ ] Document security incident response plan

### ✅ Performance Optimization

- [ ] **Caching**
  - [ ] Implement Redis for session storage
  - [ ] Add API response caching
  - [ ] Configure browser caching headers
  - [ ] Use CDN for static assets

- [ ] **Database Optimization**
  - [ ] Add indexes to frequently queried columns
  - [ ] Optimize slow queries
  - [ ] Configure connection pooling
  - [ ] Set up query monitoring

- [ ] **Load Testing**
  - [ ] Run load tests with Apache JMeter or k6
  - [ ] Test under expected peak load (2x normal)
  - [ ] Identify and fix bottlenecks
  - [ ] Document performance baselines

### ✅ Documentation

- [ ] **Technical Documentation**
  - [ ] Update API documentation (Swagger/OpenAPI)
  - [ ] Document deployment procedures
  - [ ] Create runbook for common issues
  - [ ] Document architecture diagrams
  - [ ] Write recovery procedures

- [ ] **User Documentation**
  - [ ] Create admin user guide
  - [ ] Write FAQ section
  - [ ] Document feature usage
  - [ ] Create video tutorials (optional)

### ✅ Testing

- [ ] **Automated Testing**
  - [ ] Set up unit tests (Jest, Mocha)
  - [ ] Create integration tests
  - [ ] Add end-to-end tests (Cypress, Playwright)
  - [ ] Configure CI/CD pipeline (GitHub Actions, GitLab CI)
  - [ ] Achieve >80% code coverage

- [ ] **Manual Testing**
  - [ ] Test all user flows
  - [ ] Verify error handling
  - [ ] Test on multiple browsers
  - [ ] Test on mobile devices
  - [ ] Verify email notifications

### ✅ Deployment

- [ ] **Production Environment**
  - [ ] Set up production server (AWS, Azure, DigitalOcean)
  - [ ] Configure firewall rules
  - [ ] Set up domain and DNS
  - [ ] Configure HTTPS/SSL
  - [ ] Set NODE_ENV=production
  - [ ] Disable debug modes

- [ ] **Monitoring Setup**
  - [ ] Configure error tracking (Sentry, Rollbar)
  - [ ] Set up application monitoring (New Relic, AppDynamics)
  - [ ] Create alerting rules
  - [ ] Set up on-call rotation

## 🔐 Security Best Practices

### Change These Immediately

```bash
# Generate new secrets
ENCRYPTION_KEY=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 24)
ADMIN_PASSWORD=$(openssl rand -base64 24)

# Update .env file with new values
```

### Nginx Security Headers (Already Added)

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'..." always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
```

### Database Access Control

```sql
-- Revoke public access
REVOKE ALL ON DATABASE phishguard FROM PUBLIC;

-- Create read-only user for reporting
CREATE USER phish_readonly WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE phishguard TO phish_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO phish_readonly;
```

## 📊 Monitoring Alerts

### Critical Alerts (Immediate Response)

- Database connection failures
- API response time > 2 seconds
- Error rate > 5% of requests
- Disk space < 10%
- SSL certificate expiry < 7 days

### Warning Alerts (Review Within 24h)

- API response time > 1 second
- Error rate > 1% of requests
- Disk space < 20%
- Memory usage > 80%
- Failed login attempts > 10/hour

## 🚀 Deployment Commands

### Production Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Update environment variables
nano .env

# 3. Backup current database
bash scripts/backup-enhanced.sh

# 4. Build and deploy
docker-compose build --no-cache
docker-compose up -d

# 5. Verify deployment
bash check-all.sh
bash scripts/monitor.sh

# 6. Check logs for errors
docker-compose logs -f --tail=100
```

### Rollback Procedure

```bash
# 1. Stop current deployment
docker-compose down

# 2. Checkout previous version
git checkout <previous-commit>

# 3. Restore database backup
docker-compose up -d database
cat backups/phishguard_backup_YYYYMMDD_HHMMSS_database.dump | \
  docker exec -i phishing-coupon-platform-database-1 \
  pg_restore -U phishuser -d phishguard --clean

# 4. Start all services
docker-compose up -d

# 5. Verify
bash check-all.sh
```

## 🆘 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs service-name

# Check container status
docker ps -a

# Restart specific service
docker-compose restart service-name

# Full restart
docker-compose down && docker-compose up -d
```

### Database Connection Issues

```bash
# Check database is running
docker exec phishing-coupon-platform-database-1 pg_isready -U phishuser

# Check connections
docker exec phishing-coupon-platform-database-1 psql -U phishuser -d phishguard -c "SELECT * FROM pg_stat_activity;"

# Reset database (WARNING: DATA LOSS)
docker-compose down -v
docker-compose up -d
```

### SSL Certificate Issues

```bash
# Check certificate expiry
openssl x509 -in nginx/ssl/server.crt -noout -dates

# Regenerate certificates
bash scripts/generate-ssl.sh

# Restart nginx
docker-compose restart nginx
```

## 📞 Support Contacts

- **On-Call Engineer**: [Your contact]
- **Database Admin**: [Your contact]
- **Security Team**: [Your contact]
- **Hosting Provider**: [Support link]

## 📅 Maintenance Schedule

- **Daily**: Automated backups at 2:00 AM
- **Weekly**: Log rotation and cleanup
- **Monthly**: Security updates and patches
- **Quarterly**: Full security audit
- **Annually**: SSL certificate renewal

## ✅ Pre-Launch Final Checks

```bash
# Run all checks
bash check-all.sh

# Monitor for 5 minutes
bash scripts/monitor.sh

# Test critical flows
curl -sk https://your-domain.com/api/health
curl -sk https://your-domain.com/api/public/coupons

# Check SSL
curl -vI https://your-domain.com 2>&1 | grep -i ssl

# Verify backups work
bash scripts/backup-enhanced.sh
```

---

**Last Updated**: $(date)  
**Version**: 1.0  
**Maintained By**: PhishGuard Security Team
