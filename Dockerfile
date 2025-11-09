FROM node:20

WORKDIR /repo
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*
COPY . .
RUN npm install
CMD ["echo", "Base image ready"]