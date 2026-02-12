FROM node:22.12.0-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# dist 폴더 정적 서버 실행
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3001"]