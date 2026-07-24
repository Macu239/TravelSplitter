FROM node:20-alpine

WORKDIR /client

COPY yarn.lock package.json /client/
RUN yarn install --frozen-lockfile

COPY . /client/

RUN npm run build

RUN chown -R node:node /client
USER node

EXPOSE 3000

CMD [ "yarn", "start" ]
