#FROM node:alpine as builder
#
#WORKDIR /app
#
#COPY package.json .
#RUN npm install
#COPY . .
#RUN ["npm", "run", "build"]
#
#FROM nginx
#EXPOSE 80
#COPY --from=builder /app/public /usr/share/nginx/html


FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
