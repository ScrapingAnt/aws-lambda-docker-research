set -ex

IMAGE_NAME="lambda-custom"
#IMAGE_NAME="lambda-aws-based"
echo "Deploying ${IMAGE_NAME}"
REGION=$(aws configure get region)
echo "Using region ${REGION}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Using account id ${ACCOUNT_ID}"
IMAGE_URI="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${IMAGE_NAME}:$(date +%s)"
S3_BUCKET="${IMAGE_NAME}-delete-me"

aws s3api create-bucket --bucket ${S3_BUCKET} --region "${REGION}" --create-bucket-configuration "LocationConstraint=${REGION}" || true
aws ecr create-repository \
    --repository-name ${IMAGE_NAME} \
    --region "${REGION}" || true
aws ecr get-login-password --region "${REGION}" | docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
docker tag ${IMAGE_NAME}:latest "${IMAGE_URI}"
docker push "${IMAGE_URI}"

sam deploy --template-file deploy/template.yaml --stack-name "${IMAGE_NAME}" --region "${REGION}" --s3-bucket "${S3_BUCKET}" \
    --parameter-overrides ImageUriParameter="${IMAGE_URI}" FunctionNameParameter="${IMAGE_NAME}" \
    --image-repository ${IMAGE_URI} --capabilities CAPABILITY_IAM