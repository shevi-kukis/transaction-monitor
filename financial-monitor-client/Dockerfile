
FROM node:20 AS build
WORKDIR /app




COPY package*.json ./
RUN npm install --include=dev


COPY . .

RUN rm -rf dist && npx tsc -b && npx vite build

RUN npx tsc -b && npx vite build



FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]