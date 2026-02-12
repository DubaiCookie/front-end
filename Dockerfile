FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# dist 폴더 정적 서버 실행
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3001"]