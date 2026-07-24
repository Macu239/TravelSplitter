FROM node:20-alpine

# Everything below runs relative to /app inside the container
WORKDIR /app

# Copy manifests first so `yarn install` is cached separately from source changes
COPY yarn.lock package.json /app/
RUN yarn install --frozen-lockfile  --production
# Now copy the actual application source    
COPY . /app/

#INPORTANT
# Run as the built-in non-root user instead of root
RUN chown -R node:node /app
USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

CMD ["node", "bin/www"]


