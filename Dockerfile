FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install npm list --depth=0

CMD [ "npm", "start" ]

COPY . .