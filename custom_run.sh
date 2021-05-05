docker run --rm \
    -v ~/.aws-lambda-rie:/aws-lambda \
    -p 9000:8080 \
    --entrypoint /aws-lambda/aws-lambda-rie \
    lambda-custom \
    /usr/local/bin/npx aws-lambda-ric app.handler
