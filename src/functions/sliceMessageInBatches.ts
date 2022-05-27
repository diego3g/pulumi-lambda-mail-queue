import * as aws from '@pulumi/aws'
import { BucketEvent } from "@pulumi/aws/s3";

export const sliceMessageInBatchesHandler = async (event: BucketEvent): Promise<void> => {
  const sqs = new aws.sdk.SQS()

  if (!event.Records) {
    return;
  }

  if (!process.env.queueURL) {
    return;
  }

  for (const [key, record] of event.Records.entries()) {
    await sqs.sendMessageBatch({
      QueueUrl: process.env.queueURL,
      Entries: [
        { 
          Id: key.toString(), 
          MessageBody: record.s3.object.key 
        },
      ]
    }).promise()
  }
};
