# Node.js Kafka Client

The goal of this client is to give a visualisation of messages on a kafka topic. 

Deploy to Heroku

[![Deploy on Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

Once deployed, attach your Kafka addon

heroku addons:attach KAFKA_ADDON_ID -a CLIENT_APP_NAME

This application was built mostly from the very excellent [Dreamhouse App](https://github.com/dreamhouseapp/dreamhouse-web-app/tree/kafka), in particular from the Kafka branch of that repository