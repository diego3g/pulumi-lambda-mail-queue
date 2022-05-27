import * as aws from "@pulumi/aws";

import { sliceMessageInBatchesHandler } from "../functions/sliceMessageInBatches";
import { sendMailQueue } from "./sendMailQueue.sqs";

const lambdaRole = new aws.iam.Role("sliceMessageInBatches-lambda-role", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: "lambda.amazonaws.com" }),
});

const lambdaPolicy: aws.iam.PolicyDocument = {
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Resource: "*",
      Action: [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "sqs:*",
      ],
    },
  ],
};

const lambdaSESPolicy = new aws.iam.Policy("sliceMessageInBatches-lambda-policy", {
  path: "/",
  policy: lambdaPolicy,
});

const rolePolicyAttachment = new aws.iam.RolePolicyAttachment(
  "sliceMessageInBatches-lambda-policy-attachment",
  {
    policyArn: lambdaSESPolicy.arn,
    role: lambdaRole.name,
  },
);

export const sliceMessageInBatchesLambda = new aws.lambda.CallbackFunction("sliceMessageInBatchesLambda", {
  memorySize: 256,
  timeout: 30,
  runtime: 'nodejs14.x',
  callback: sliceMessageInBatchesHandler,
  role: lambdaRole,
  environment: {
    variables: {
      queueURL: sendMailQueue.url,
    }
  }
}, {
  dependsOn: [
    rolePolicyAttachment,
  ]
});