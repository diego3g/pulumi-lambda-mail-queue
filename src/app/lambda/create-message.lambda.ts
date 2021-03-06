import * as aws from "@pulumi/aws";
import { createLambdaRole } from "../../util/create-lambda-role";
import { messagesTable } from "../dynamodb/messages.table";
import { mailBucket } from "../s3/mailBucket.s3";
import { createMessageHandler } from "./handlers/create-message-handler";

const { role, policyAttachment } = createLambdaRole({
  name: 'create-message',
  policyStatements: [
    {
      Effect: "Allow",
      Resource: mailBucket.arn.apply(arn => `${arn}/messages/*`),
      Action: [
        "s3:*",
      ],
    },
    {
      Effect: "Allow",
      Resource: messagesTable.arn,
      Action: [
        "dynamodb:PutItem",
      ],
    }
  ]
})

export const createMessageLambda = new aws.lambda.CallbackFunction("create-message", {
  memorySize: 256,
  timeout: 30,
  runtime: 'nodejs14.x',
  callback: createMessageHandler,
  role,
  environment: {
    variables: {
      bucketName: mailBucket.id,
      messagesTableName: messagesTable.id,
    }
  }
}, {
  dependsOn: [
    policyAttachment,
  ]
});