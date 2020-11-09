FROM node:12-slim
WORKDIR /www
ENV NODE_ENV development
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
CMD ["npm", "start"]
EXPOSE 80
