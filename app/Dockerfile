FROM node:12.12.0-alpine
COPY package.json package.json
RUN npm install
COPY *.js /
COPY src /src
COPY views /views
CMD ["npm", "start"]
