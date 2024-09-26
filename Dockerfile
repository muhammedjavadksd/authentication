FROM  node:22.4.1-alpine
WORKDIR /app/Authentication
COPY package*.json ./
RUN npm install
COPY . .
RUN npx tsc
CMD ["npm", "start"]
