# W1A Bot
Right. This is a chatbot for Slack that listens out for W1A catchphrases and responds appropriately. Yes, exactly.

## How it works
Okay. This bot has been trained to identify any repeated phrases, and the responses to those phrases, based on the [scripts](https://www.springfieldspringfield.co.uk/episode_scripts.php?tv-show=w1a-2014) from W1A. You can view these in [model.js](model.js). Brilliant.

The bot listens to the messages of any channels it's subscribed to, identifies  matching phrases using a fuzzy search algorithm, then sends a fitting response. I know, right?

The code is set up to run as an AWS Lambda function. This is good, guys.

## Usage
Right, yes. There are two ways to interact with the bot. If you invite it to a channel, it will listen to all the messages and chime in when anybody says a matching phrase. Fabulous. Alternatively, you can direct message it, and it will respond directly if any of your phrases match. Great.

## Installation

#### 1. AWS Lambda
1. Create a Lambda function on your AWS account from scratch, with Node.js 10.x runtime. Note the function name, AWS region and ARN of the execution role.
1. Add API Gateway as a trigger with a new API and open security. Edit the API to replace the ANY method with a POST method pointing to your function. Note the endpoint URL (visible on the Lambda function page).
1. Create an IAM user with programmatic access and AWSLambdaFullAccess permissions. Note the access key ID and secret access key.

#### 2. Code installation
1. Clone this repository
1. Run `npm install` and `npm install -g node-lambda`
1. Run `node-lambda setup`.
1. Edit `.env` and configure `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ROLE_ARN`, `AWS_REGION` and `AWS_FUNCTION_NAME`. Remove `AWS_ENVIRONMENT`, unless you have specified an environment for your Lambda function.

#### 3. Slack API part 1
1. Create a new app in https://api.slack.com/apps
1. Set up the Bot User and update `config.js` with the bot's display name.
1. Note the Verification Token in Basic Information.
1. Install the app and note the Bot User OAuth Access Token.
1. Edit `deploy.env` and add the two environmental variables `VERIFICATION_TOKEN` and `BOT_USER_TOKEN`

#### 4. Code deployment
1. Run `npm run deploy` to deploy the W1A bot to your Lambda function.

#### 5. Slack API part 2
1. In the Slack API config, enable Event Subscriptions and enter the endpoint URL of your Lambda function as the request URL. If all is well, this should be verified.
1. Add Bot User Events for `message.channels`, `message.groups` and `message.im`, then save changes.


So that's all good.
