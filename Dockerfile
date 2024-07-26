FROM node:22.4.1-alpine
WORKDIR /app
COPY . /app
RUN npm install
CMD ['npm','start']