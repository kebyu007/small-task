FROM node:18-alpine

# Ishchi papkani yaratish
WORKDIR /app

# Package fayllarni ko'chirish va o'rnatish
COPY package*.json ./
RUN npm install

# Dastur kodlarini ko'chirish
COPY . .

# Portni ochish
EXPOSE 3000

# Standart buyruq (Lekin buni docker-compose o'zgartirishi mumkin)
CMD ["npm", "run", "start:dev"]
