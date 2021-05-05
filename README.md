# Puppeteer performance in AWS Lambda Docker containers
This repo contains all code and scripts, used in article https://dev.to/megabotan/aws-lambda-puppeteer-in-docker
## Local run
You need to setup docker, and download aws-lambda-rie binaries `./download_rie.sh`
#### Run custom docker lambda image
`./custom_build.sh && ./custom_run.sh`
#### Run AWS based docker image
`./aws_based_build.sh && ./aws_based_run.sh`
#### Test running image locally
`curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{"url": "https://example.com"}'`
## Deploy
First you have to [setup AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html). Don't forget to set credentials and region in AWS cli config files.
After that install [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html).

All deploy steps are in `deploy/push_image_and_deploy_lambda.sh`
