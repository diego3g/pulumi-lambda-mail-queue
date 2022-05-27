import * as aws from "@pulumi/aws";

import { sendMailHandler } from "../functions/sendMail";

const lambdaRole = new aws.iam.Role("sendMail-lambda-role", {
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
        "ses:SendEmail",
        "sqs:*",
      ],
    },
  ],
};

const lambdaSESPolicy = new aws.iam.Policy("sendMail-lambda-policy", {
  path: "/",
  policy: lambdaPolicy,
});

const rolePolicyAttachment = new aws.iam.RolePolicyAttachment(
  "sendMail-lambda-policy-attachment",
  {
    policyArn: lambdaSESPolicy.arn,
    role: lambdaRole.name,
  },
);

export const sendMailLambda = new aws.lambda.CallbackFunction("sendMailLambda", {
  memorySize: 256,
  timeout: 30,
  runtime: 'nodejs14.x',
  callback: sendMailHandler,
  role: lambdaRole,
}, {
  dependsOn: [
    rolePolicyAttachment,
  ]
});