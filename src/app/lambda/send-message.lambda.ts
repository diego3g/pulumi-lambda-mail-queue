import * as aws from "@pulumi/aws";
import { createLambdaRole } from "../../util/create-lambda-role";
import { messagesTable } from "../dynamodb/messages.table";
import { pendingRecipientsTable } from "../dynamodb/pending-recipiens.table";
import { mailBucket } from "../s3/mailBucket.s3";
import { sendMessageHandler } from "./handlers/send-message-handler";

const { role, policyAttachment } = createLambdaRole({
  name: 'send-message',
  policyStatements: [
    {
      Effect: "Allow",
      Resource: mailBucket.arn.apply(arn => `${arn}/messages/*`),
      Action: [
        "s3:*",
      ],
    },
    {
      Sid: 'UpdateMessages',
      Effect: "Allow",
      Resource: messagesTable.arn,
      Action: [
        "dynamodb:UpdateItem",
      ],
    },
    {
      Sid: 'WriteRecipients',
      Effect: "Allow",
      Resource: pendingRecipientsTable.arn,
      Action: [
        "dynamodb:BatchWriteItem",
      ],
    }
  ]
})

export const sendMessageLambda = new aws.lambda.CallbackFunction("send-message", {
  memorySize: 256,
  timeout: 30,
  runtime: 'nodejs14.x',
  callback: sendMessageHandler,
  role,
  environment: {
    variables: {
      bucketName: mailBucket.id,
      messagesTableName: messagesTable.id,
      pendingRecipientsTableName: pendingRecipientsTable.id,
    }
  }
}, {
  dependsOn: [
    policyAttachment,
  ]
});