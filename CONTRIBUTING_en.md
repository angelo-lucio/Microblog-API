# Coding Guidelines - Project Microblog

To ensure code stability and smooth collaboration, please follow these rules.

# Branching Policy
The **`main`** branch is strictly for stable backups and production-ready code.

1.  **No Direct Pushes:** Direct pushes to `main` are forbidden.
2.  **Feature Branches:** All work must happen on separate branches.
    * *Naming:* `feature/task-name`, `fix/bug-description`, or `refactor/change-name`.
3.  **Pull Requests:** When your task is finished, open a Pull Request (PR) to merge into `main`.
4.  **Local Testing:** Always test your code (and your Docker setup) before requesting a merge.



## Docker & Database
* **Docker Compose:** Do not change shared ports (e.g., 5432) without consulting the team.
* **Drizzle ORM:** If you change the schema, include the generated migrations in your commit so others can sync their local DBs.

## Commit Messages
Simple convention:
* `feat:` New features
* `fix:` Bug fixes
* `docs:` Documentation changes
* `style:` Formatting/Linting

*Example: `feat: add user table schema`*
