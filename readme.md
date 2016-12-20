# Node.js Kafka Client

The goal of this client is to give a visualisation of messages on a kafka topic. 

Deploy to Heroku

[![Deploy on Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

Once deployed, attach your Kafka addon

heroku addons:attach KAFKA_ADDON_ID -a CLIENT_APP_NAME

This application was built mostly from the very excellent [Dreamhouse App](https://github.com/dreamhouseapp/dreamhouse-web-app/tree/kafka), in particular from the Kafka branch of that repository


###Run Locally

[Install Node.js](https://nodejs.org/en/)

Fetch the npm dependencies
```
npm install
```
Get the kafka environment
```
heroku config -s -a HEROKU_APP_NAME > .env
set -o allexport
source .env
set +o allexport
```
Create the kafka certs (the [.profile](https://devcenter.heroku.com/articles/dynos#the-profile-file) file will execute on dyno startup as well)
```
./.profile
```

####Add .env, client.key, client.crt to your .gitignore (or similar)

Start the app
```
npm start
```
