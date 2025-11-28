# 🚀 Deployment Guide - Service-Spot Application

## Understanding Data Storage

### Local Development (Current Setup)
- **MySQL Workbench** is just a GUI tool to VIEW and MANAGE your database
- Your actual data is stored in the **MySQL Server** running on `localhost:3306`
- The database name is `service_spot`
- Data persists in MySQL's data directory (usually `C:\ProgramData\MySQL\MySQL Server 8.x\Data\`)

### How Initial Data is Loaded

1. **Schema Creation**: When you run the Spring Boot app, Hibernate creates tables based on your `@Entity` classes
2. **Data Initialization**: The `data.sql` file inserts initial categories into the database
3. **User Data**: All user registrations, services, and bookings are saved to the MySQL database

---

## 🌐 Deployment Options

### Option 1: Cloud Database Services (Recommended)

#### A. **Railway** (Easiest - Free Tier Available)
- Provides both backend hosting and MySQL database
- Steps:
  1. Sign up at https://railway.app
  2. Create new project → Add MySQL
  3. Deploy Spring Boot app from GitHub
  4. Railway automatically provides DATABASE_URL

#### B. **PlanetScale** (MySQL-Compatible, Serverless)
- Free tier: 5GB storage
- Steps:
  1. Sign up at https://planetscale.com
  2. Create database
  3. Get connection string
  4. Use in production

#### C. **AWS RDS** (Production-Grade)
- Scalable and reliable
- Free tier: 750 hours/month for 12 months
- Steps:
  1. Go to AWS RDS Console
  2. Create MySQL database instance
  3. Note endpoint, username, password
  4. Configure security groups to allow access

#### D. **Google Cloud SQL**
- Similar to AWS RDS
- Integrated with Google Cloud Platform

#### E. **Azure Database for MySQL**
- Microsoft's cloud MySQL solution

---

## 📦 Deployment Strategy

### Step 1: Prepare Your Application

#### Update `application.properties` for Production

Create `application-prod.properties`:

```properties
# Production Configuration
spring.application.name=Service-Spot
server.port=${PORT:8080}

# Database Configuration (from environment variables)
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# Initialize data only on first deployment
spring.sql.init.mode=always
spring.jpa.defer-datasource-initialization=true

# Security
server.error.include-message=never
server.error.include-binding-errors=never
server.error.include-stacktrace=never
```

### Step 2: Use Database Migrations (Recommended)

Instead of `data.sql`, use **Flyway** or **Liquibase** for production:

#### Add Flyway to `pom.xml`:

```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-mysql</artifactId>
</dependency>
```

#### Create Migration Files:

```
src/main/resources/db/migration/
├── V1__create_tables.sql
├── V2__insert_categories.sql
├── V3__add_indexes.sql
```

Example `V1__create_tables.sql`:
```sql
-- Flyway will create tables based on your entities
-- This is just for reference or manual schema creation
```

Example `V2__insert_categories.sql`:
```sql
INSERT INTO service_categories (name, description, icon, active) VALUES
('Education', 'Education and tutoring services', 'EDU', true),
('Plumbing', 'Plumbing and pipe services', 'PLB', true),
('Electrical', 'Electrical services and repairs', 'ELE', true)
ON DUPLICATE KEY UPDATE name=name;
```

---

## 🔄 Deployment Workflow

### Backend Deployment

#### Option A: Railway Deployment

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to Railway Dashboard
   - New Project → Deploy from GitHub
   - Select your repository
   - Railway auto-detects Spring Boot
   - Add MySQL database from Railway marketplace

3. **Environment Variables** (Railway sets automatically)
   - `DATABASE_URL`
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `SPRING_PROFILES_ACTIVE=prod`

#### Option B: Heroku Deployment

1. **Create `system.properties`**:
   ```properties
   java.runtime.version=21
   ```

2. **Create `Procfile`**:
   ```
   web: java -Dserver.port=$PORT -Dspring.profiles.active=prod -jar target/Service-Spot-0.0.1-SNAPSHOT.jar
   ```

3. **Deploy**:
   ```bash
   heroku login
   heroku create service-spot-app
   heroku addons:create jawsdb:kitefin  # MySQL addon
   git push heroku main
   ```

#### Option C: AWS Elastic Beanstalk

1. Package as JAR:
   ```bash
   mvn clean package -DskipTests
   ```

2. Deploy to Elastic Beanstalk
3. Add RDS MySQL database
4. Configure environment variables

---

### Frontend Deployment

#### Option 1: Vercel (Recommended for React)

1. **Update `frontend/.env.production`**:
   ```
   VITE_API_BASE_URL=https://your-backend.railway.app/api
   ```

2. **Deploy**:
   ```bash
   cd frontend
   npm run build
   # Push to GitHub, then connect to Vercel
   ```

#### Option 2: Netlify

Similar to Vercel, build and deploy React app.

#### Option 3: Same Server as Backend

Build frontend and serve from Spring Boot:

```bash
cd frontend
npm run build
# Copy dist folder to backend/src/main/resources/static
```

---

## 🛠️ Initialize Production Database

### Method 1: Run data.sql on First Deployment

Keep `spring.sql.init.mode=always` in production properties.

### Method 2: Use DataInitializer Component

Create `src/main/java/.../config/DataInitializer.java`:

```java
@Component
@Slf4j
public class DataInitializer {
    
    @Autowired
    private ServiceCategoryRepository categoryRepository;
    
    @PostConstruct
    @Transactional
    public void initCategories() {
        if (categoryRepository.count() == 0) {
            log.info("Initializing default categories...");
            
            List<ServiceCategory> categories = Arrays.asList(
                ServiceCategory.builder().name("Education").description("Education services").icon("EDU").active(true).build(),
                ServiceCategory.builder().name("Plumbing").description("Plumbing services").icon("PLB").active(true).build(),
                ServiceCategory.builder().name("Electrical").description("Electrical services").icon("ELE").active(true).build()
                // ... add more
            );
            
            categoryRepository.saveAll(categories);
            log.info("✅ Default categories created");
        }
    }
}
```

### Method 3: Manual SQL Execution

1. Connect to production database using MySQL client
2. Run your SQL scripts manually:
   ```bash
   mysql -h <prod-host> -u <username> -p <database> < insert-categories.sql
   ```

---

## 📊 Production Checklist

- [ ] Change `spring.jpa.hibernate.ddl-auto` to `validate` or `none` (after first deployment)
- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure CORS for frontend domain
- [ ] Enable application monitoring (New Relic, Datadog)
- [ ] Set up logging (CloudWatch, Papertrail)
- [ ] Configure CI/CD pipeline
- [ ] Set up database connection pooling
- [ ] Enable database read replicas for scaling

---

## 🔐 Security Best Practices

1. **Never commit passwords** - Use environment variables
2. **Use secrets management** - AWS Secrets Manager, HashiCorp Vault
3. **Enable SSL/TLS** for database connections
4. **Implement rate limiting**
5. **Use prepared statements** (already done with JPA)
6. **Regular security updates**

---

## 📈 Scaling Considerations

1. **Database Indexing** - Already added in entities
2. **Caching** - Redis for frequently accessed data
3. **Load Balancing** - Multiple backend instances
4. **CDN** - For static frontend assets
5. **Database Read Replicas** - For read-heavy workloads

---

## 🆘 Troubleshooting

### Issue: Categories not loading in production

**Solution**: Check if `data.sql` ran successfully:
```sql
SELECT COUNT(*) FROM service_categories;
```

### Issue: Database connection refused

**Solution**: 
- Verify DATABASE_URL format
- Check firewall rules
- Ensure database instance is running

### Issue: 500 errors on category creation

**Solution**: 
- Check backend logs
- Verify all validations pass
- Ensure database schema matches entities

---

## 📞 Quick Start Deployment (Railway)

**5-Minute Deployment:**

1. Push code to GitHub
2. Sign up at Railway.app
3. New Project → Deploy from GitHub
4. Add MySQL from marketplace
5. Deploy! Railway handles everything

**Environment auto-configured by Railway:**
- Database URL
- Port binding
- Health checks
- HTTPS certificate

---

## 💾 Data Persistence Summary

| Environment | Where Data Lives | How to Access |
|-------------|------------------|---------------|
| **Local Dev** | MySQL Server (localhost:3306) | MySQL Workbench, CLI |
| **Production** | Cloud MySQL (Railway/AWS/etc) | Cloud Console, Remote Client |
| **Backup** | Database snapshots | Cloud provider tools |

**Key Point**: MySQL Workbench is just a viewer. Your data lives in the MySQL Server, whether local or cloud-hosted.

---

## Next Steps

1. ✅ Fix backend errors (completed above)
2. ✅ Test locally with real data
3. 🔄 Choose deployment platform
4. 🚀 Deploy backend
5. 🌐 Deploy frontend
6. ✅ Verify production data

---

**Generated for Service-Spot v3.0**  
**Date**: November 29, 2025

