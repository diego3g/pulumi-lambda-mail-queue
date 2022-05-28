import * as aws from "@pulumi/aws";
import { sliceMessageInBatchesHandler } from "./handlers/sliceMessageInBatches";
import { sendMailQueue } from "../sqs/sendMailQueue.sqs";
import { createLambdaRole } from "../../util/create-lambda-role";

const { role, policyAttachment } = createLambdaRole({
  name: 'sliceMessageInBatches',
  policyStatements: [
    {
      Effect: "Allow",
      Resource: sendMailQueue.arn,
      Action: [
        "sqs:GetQueueAttributes",
        "sqs:SendMessage",
      ],
    }
  ]
})

export const sliceMessageInBatchesLambda = new aws.lambda.CallbackFunction("sliceMessageInBatchesLambda", {
  memorySize: 256,
  timeout: 30,
  runtime: 'nodejs14.x',
  callback: sliceMessageInBatchesHandler,
  role,
  environment: {
    variables: {
      queueURL: sendMailQueue.url,
    }
  }
}, {
  dependsOn: [
    policyAttachment,
  ]
});