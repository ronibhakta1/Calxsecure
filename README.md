# 🔐 Calxsecure

Calxsecure is a full-stack **monorepo project** built with **Prisma + PostgreSQL**, **Recoil state management**, and **Reusable UI components**.

This repo demonstrates a secure and scalable app setup, featuring:

- **Database package (`db`)** — Prisma ORM, migrations, seeding.  
- **Store package (`store`)** — Recoil state management.  
- **UI package (`ui`)** — Shared React components.  
- **User App (`apps/user-app`)** — Example frontend application.  

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/ronibhakta1/Calxsecure.git
cd Calxsecure
```
### 2. Install dependencies
```bash
npm install
```

### 3. Set up PostgreSQL
```bash
docker run -d --name my-postgres -e POSTGRES_PASSWORD=pass123 -p 5432:5432 postgres
```
Or use a cloud provider like Neon.tech

### 4. Configure environment variables
Copy all .env.example files to .env.
Update the DATABASE_URL with your Postgres connection string.

### 5. Set up the database
```bash
cd packages/db
npx prisma migrate dev
npx prisma db seed
```

### 6. Run the apps
```bash
npm run dev
```

