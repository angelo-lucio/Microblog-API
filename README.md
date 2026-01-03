# microblog-api

## To install dependencies:

```bash
bun install
```

## Setting up PostgreSQL

You can quickly run a PostgreSQL container for development using Docker:
```bash
docker run --name my-postgres -p 5432:5432 \
  -e POSTGRES_PASSWORD=supersecret123 \
  -e POSTGRES_DB=minitwitter \
  -d postgres
```


## To run:

```bash
bun start dev
```

## Kokilan dont forget to update readme for db schame migration

This project was created using `bun init` in bun v1.3.1. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
