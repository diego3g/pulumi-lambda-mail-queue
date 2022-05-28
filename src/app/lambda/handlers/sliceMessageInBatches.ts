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
    try {
      

      // await sqs.sendMessageBatch({
      //   QueueUrl: process.env.queueURL,
      //   Entries: [
      //     { 
      //       Id: '1', 
      //       MessageBody: record.s3.object.key 
      //     },
      //     { 
      //       Id: '2', 
      //       MessageBody: record.s3.object.key 
      //     },
      //     { 
      //       Id: '3', 
      //       MessageBody: record.s3.object.key 
      //     },
      //     { 
      //       Id: '4', 
      //       MessageBody: record.s3.object.key 
      //     },
      //     { 
      //       Id: '5', 
      //       MessageBody: record.s3.object.key 
      //     },
      //     { 
      //       Id: '6', 
      //       MessageBody: record.s3.object.key 
      //     },
      //     { 
      //       Id: '7', 
      //       MessageBody: record.s3.object.key 
      //     },
      //   ]
      // }).promise()
    } catch (err) {
      console.log(err)
    }
  }
};
