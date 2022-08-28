# We may want to make use of atlas but if not 
# then to viualize db data i have configure installation for mongo-express
# a mongodb compass look-alike
FROM node:16.17.0-alpine

ENV MONGO_DB_USERNAME=admin \
    MONGO_DB_PWD=password \ 
    NODE_ENV=production


RUN npm install --production

EXPOSE 8080

ENV PORT=8080
ENV HOST=0.0.0.0

# this can be commented out later if we 
# choose to run npm build manually to reduce image size
RUN npm run build

RUN mkdir -p /base/app

COPY . /base/app

CMD ["npm", "start"]