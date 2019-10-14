FROM node:latest
COPY package.json package.json
RUN npm install
COPY *.js /
COPY src /src
COPY static /static
COPY views /views
CMD ["npm", "start"]