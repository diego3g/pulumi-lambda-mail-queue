import { createMessageLambda } from "./app/lambda/create-message.lambda";
import { sendMailLambda } from "./app/lambda/sendMail.lambda";
import { sliceMessageInBatchesLambda } from "./app/lambda/sliceMessageInBatches.lambda";
import { mailBucket } from "./app/s3/mailBucket.s3";
import { sendMailQueue } from "./app/sqs/sendMailQueue.sqs";

// sendMailQueue.onEvent('mail', sendMailLambda, {
//   maximumBatchingWindowInSeconds: 5,
// });

// mailBucket.onObjectCreated('sliceListInBatches', sliceMessageInBatchesLambda, {
//   filterPrefix: 'messages/',
//   filterSuffix: '.json'
// })

export = {
  sendMailQueueURL: sendMailQueue.id,
  bucketName: mailBucket.id,
  createMessageLambdaName: createMessageLambda.name,
}