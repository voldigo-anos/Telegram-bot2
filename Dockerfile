FROM node:22-slim

# Dossier de l'application appartenant a l'utilisateur "node" (non-root) :
# c'est ce qui evite "EACCES: permission denied, mkdir '/app/cache'".
RUN mkdir -p /app && chown node:node /app
WORKDIR /app
USER node

COPY --chown=node:node package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY --chown=node:node . .

# Dossiers ecrits par le bot au demarrage
RUN mkdir -p cache tmp scripts/cmds/cache scripts/events/cache database/data

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
