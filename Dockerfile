FROM node:16

WORKDIR /app
COPY .env .
COPY package*.json .
RUN npm install
COPY . .

CMD ["npm", "run", "start"]