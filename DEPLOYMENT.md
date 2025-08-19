# 🚀 ML Monitoring Dashboard - Deployment Guide

This guide covers deployment options for the enhanced ML monitoring dashboard with database integration, Docker containerization, and production-ready features.

## Deployment Options

### 1. Local Development
For development and testing purposes.

#### Quick Start
```bash
# Automated setup
./scripts/setup.sh
./scripts/start-dev.sh
```

#### Manual Setup
```bash
# Backend setup
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
python model/train_model.py
uvicorn api.main:app --reload

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

**Access Points:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 2. Docker Development
Containerized development environment.

```bash
# Quick Docker start
./scripts/docker-start.sh

# Or manual
docker-compose up --build
```

**Features:**
- Hot reload for both frontend and backend
- Persistent database storage
- Isolated environment
- Easy dependency management

### 3. Production Deployment
Optimized for production environments.

#### Docker Production
```bash
# Production deployment
docker-compose --profile production up --build -d

# Monitor logs
docker-compose logs -f

# Scale services
docker-compose up --scale backend=3 --scale frontend=2
```

**Production Features:**
- Multi-stage Docker builds
- Nginx reverse proxy
- Health checks and restart policies
- Optimized static asset serving
- Gzip compression

#### Cloud Deployment (AWS/GCP/Azure)

##### Option A: Docker on Cloud VM
```bash
# On cloud instance
git clone <repository>
cd ml-monitoring-dashboard
sudo docker-compose --profile production up -d
```

##### Option B: Kubernetes (K8s)
```yaml
# Example deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-monitoring
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ml-monitoring
  template:
    spec:
      containers:
      - name: backend
        image: ml-monitoring-backend:latest
        ports:
        - containerPort: 8000
      - name: frontend
        image: ml-monitoring-frontend:latest
        ports:
        - containerPort: 80
```

##### Option C: Cloud Services
- **AWS**: ECS, EKS, or Elastic Beanstalk
- **GCP**: Cloud Run, GKE, or App Engine
- **Azure**: Container Instances, AKS, or App Service

## 🗄️ Database Configuration

### SQLite (Default)
Perfect for development and small-scale production.
```bash
DATABASE_URL=sqlite:///./ml_monitoring.db
```

### PostgreSQL (Recommended for Production)
```bash
# Update requirements.txt
echo "psycopg2-binary==2.9.7" >> requirements.txt

# Environment variable
DATABASE_URL=postgresql://user:password@localhost:5432/ml_monitoring
```

### MySQL
```bash
# Update requirements.txt  
echo "mysql-connector-python==8.1.0" >> requirements.txt

# Environment variable
DATABASE_URL=mysql+mysqlconnector://user:password@localhost:3306/ml_monitoring
```

## 📊 Monitoring & Observability

### Health Checks
- **Backend**: `/docs` endpoint health check
- **Frontend**: HTTP 200 response check
- **Database**: Connection validation

### Metrics Collection
- **System Metrics**: CPU, memory, disk usage
- **API Metrics**: Response time, error rates
- **ML Metrics**: Model performance, prediction accuracy
- **Business Metrics**: Prediction volume, confidence trends

### Logging
```bash
# View application logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Database logs
sqlite3 ml_monitoring.db ".tables"
sqlite3 ml_monitoring.db "SELECT * FROM system_metrics LIMIT 10;"
```

## 🔒 Security Considerations

### Production Security
```yaml
# docker-compose.prod.yml
services:
  backend:
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SECRET_KEY=${SECRET_KEY}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}
```

### SSL/TLS Configuration
```nginx
# nginx-ssl.conf
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://frontend:80;
    }
}
```

### Environment Variables
```bash
# .env.production
DATABASE_URL=postgresql://user:password@db:5432/ml_monitoring
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
API_RATE_LIMIT=1000
```

## Scaling

### Horizontal Scaling
```bash
# Scale backend API
docker-compose up --scale backend=3

# Load balancer configuration
upstream backend {
    server backend_1:8000;
    server backend_2:8000;
    server backend_3:8000;
}
```

### Database Scaling
- **Read Replicas**: For analytics queries
- **Connection Pooling**: SQLAlchemy pool configuration
- **Caching**: Redis for frequently accessed data

### Performance Optimization
- **CDN**: CloudFlare/AWS CloudFront for static assets
- **Database Indexing**: Optimize query performance
- **API Caching**: Cache prediction results
- **Async Processing**: Background tasks for heavy operations

## 🔧 Troubleshooting

### Common Issues

#### Backend Connection Issues
```bash
# Check backend status
curl http://localhost:8000/docs

# View backend logs
docker-compose logs backend
```

#### Database Issues
```bash
# Recreate database
python -c "from api.database import init_database; init_database()"

# Check database file
ls -la *.db
```

#### Frontend Build Issues
```bash
# Clear node_modules and rebuild
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Performance Issues
- Monitor CPU/memory usage with `docker stats`
- Check database query performance
- Analyze network bottlenecks
- Review application logs for errors

## Deployment Checklist

### Pre-deployment
- [ ] Model trained and saved (`model/model.pkl`)
- [ ] Environment variables configured
- [ ] Database initialized
- [ ] SSL certificates (if applicable)
- [ ] Domain/DNS configured
- [ ] Backup strategy in place

### Post-deployment
- [ ] Health checks passing
- [ ] Monitoring alerts configured
- [ ] Log aggregation working
- [ ] Security scan completed
- [ ] Performance baseline established
- [ ] Documentation updated

### Maintenance
- [ ] Regular backups scheduled
- [ ] Security updates applied
- [ ] Performance monitoring active
- [ ] Model retraining pipeline
- [ ] Capacity planning reviewed

## Support

For deployment issues:
1. Check the logs: `docker-compose logs -f`
2. Verify health checks: `curl http://localhost:8000/docs`
3. Review environment variables
4. Consult the troubleshooting section
5. Open an issue with deployment details

---

**Congratulations!** Your enhanced ML monitoring dashboard is now production-ready with advanced analytics, real-time monitoring, and professional deployment capabilities. 