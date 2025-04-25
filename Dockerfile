FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false --ignore-scripts
COPY . .
RUN chmod -R 755 node_modules/.bin/vite
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
CMD while ! curl -s http://backend:80 > /dev/null; do echo "Waiting for backend..."; sleep 1; done; nginx -g 'daemon off;'
EXPOSE 80