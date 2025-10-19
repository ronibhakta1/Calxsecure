# 🔐 **Calxsecure**

**Calxsecure** is a full-stack **monorepo project** built with **TurboRepo**, **Prisma + PostgreSQL**, **Next.js**, **Recoil state management**, and **Reusable UI components**.


This repo demonstrates a **secure, scalable banking app** with:
- **User App** — Customer banking portal
- **Merchant App** — Business dashboard  
- **Docs Site** — Project documentation
- **Bank Webhook** — Payment processing
- **Database package (`db`)** — Prisma ORM, migrations
- **Store package (`store`)** — Recoil state management
- **UI package (`ui`)** — Shared React components

---

## 🚀 **ONE-COMMAND SETUP** *(Your Contribution!)*

```bash
git clone https://github.com/ronibhakta1/Calxsecure.git
cd Calxsecure
npm install
npm run docker:up && npm run dev
```
## 📁 PROJECT STRUCTURE
Calxsecure/
├── apps/
│   ├── userapp/         
│   ├── merchantapp/      
├── packages/
│   ├── db/              # Prisma + PostgreSQL
│   ├── store/           # Recoil state
│   └── ui/              # Shared components
├── docker-compose.yml   
└── Dockerfile           
## 💻 DEVELOPMENT WORKFLOW
```bash
npm run docker:up    
npm run dev
     
# When done
npm run docker:down  # Stop DB
```
## Before PR must do
```bash
npm run build
```
### ⭐ Star this repo! Made with ❤️ by the Calxsecure Team
