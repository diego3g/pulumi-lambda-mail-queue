import { mailBucket } from "./services/mailBucket.s3";
import { sendMailLambda } from "./services/sendMail.lambda";
import { sendMailQueue } from "./services/sendMailQueue.sqs";
import { sliceMessageInBatchesLambda } from "./services/sliceMessageInBatches.lambda";

sendMailQueue.onEvent('mail', sendMailLambda, {
  maximumBatchingWindowInSeconds: 5,
});

mailBucket.onObjectCreated('sliceListInBatches', sliceMessageInBatchesLambda, {
  filterPrefix: 'messages/',
  filterSuffix: '.json'
})

export = {
  sendMailQueueURL: sendMailQueue.id,
  bucketName: mailBucket.id,
}