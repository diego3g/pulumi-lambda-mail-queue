import * as aws from "@pulumi/aws";
import { createLambdaRole } from "../../util/create-lambda-role";
import { sendMailQueue } from "../sqs/sendMailQueue.sqs";
import { sendMailHandler } from "./handlers/sendMail";

const { role, policyAttachment } = createLambdaRole({
  name: 'sendMail',
  policyStatements: [
    {
      Effect: "Allow",
      Resource: "*",
      Action: [
        "ses:SendEmail",
      ],
    },
    {
      Effect: "Allow",
      Resource: sendMailQueue.arn,
      Action: [
        "sqs:GetQueueAttributes",
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
      ],
    }
  ]
})

export const sendMailLambda = new aws.lambda.CallbackFunction("sendMailLambda", {
  memorySize: 256,
  timeout: 30,
  runtime: 'nodejs14.x',
  callback: sendMailHandler,
  role,
}, {
  dependsOn: [
    policyAttachment,
  ]
});