FROM node:22-bullseye

WORKDIR /front_robotics
COPY . .

RUN npm install
CMD ["npm", "run", "dev"]