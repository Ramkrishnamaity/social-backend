FROM node:18-slim

WORKDIR /usr/app/social-one

COPY package*.json ./

COPY . .

RUN npm install

EXPOSE 8000

CMD ["npm", "start"]