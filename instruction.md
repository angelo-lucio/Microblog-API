# Small Talk

<p align="center">
  <img src="./frontend/smalltalklogo.png" width="180" alt="Small Talk Logo" />
</p>

<p align="center">
  <strong>A Minimal Twitter-like Social Media Application</strong>
</p>

---

# 1. What is Small Talk?

Small Talk is a mini Twitter-like web application.

Users can:
- Register an account
- Login
- Create posts
- Edit posts
- Delete posts
- View all posts

This project was created as a school assignment to demonstrate:
- Backend development
- JWT authentication
- REST API design
- PostgreSQL database usage
- Drizzle ORM
- Docker containerization

---

# 2. Technologies Used

- Bun (JavaScript runtime)
- Express (Backend framework)
- PostgreSQL (Database)
- Drizzle ORM (Database schema & query tool)
- JWT (Authentication system)
- Docker & Docker Compose (Container system)

---

# 3. Complete Installation Guide (Beginner Friendly)

Follow these steps exactly in order.

---

## STEP 1 – Install Git

Git is required to download the project.

1. Go to:  
  have to fill

2. Download Git for Windows

3. Install with default settings

4. Restart your computer

## Step 2 - Install Bun:

Open PowerShell and run:
powershell -c "irm bun.sh/install.ps1 | iex"

After installation verify: 
bun --version

## Step 3 - Start Docker:

Inside the project folder, run:
docker compose down
docker compose up -d --build

---

# 4. Start the Application

After the containers start successfully, open your browser:
http://localhost

---

# 5. Database Management (Drizzle)

Push schema:
bunx drizzle-kit push

Or inside Docker:
docker compose exec minitwitter bunx drizzle-kit push

Set environment variable (PowerShell):
$env:DATABASE_URL="postgresql://postgres:supersecret123@localhost:5432/minitwitter"

Open Drizzle Studio:
bunx drizzle-kit studio