import * as aws from '@pulumi/aws'
import crypto from 'node:crypto';

interface CreateMessageEvent {
  from: string;
  subject: string;
  templateFilePath: string;
  recipientListFilePath: string;
}

export const createMessageHandler = async (event: CreateMessageEvent): Promise<any> => {
  const s3 = new aws.sdk.S3()
  const db = new aws.sdk.DynamoDB()
  // const lambda = new aws.sdk.Lambda()

  const { bucketName, messagesTableName } = process.env;

  if (!bucketName) {
    throw new Error('The bucket name was not provided in the environment.');
  }

  if (!messagesTableName) {
    throw new Error('The messages table name was not provided in the environment.');
  }

  await Promise.all([
    s3.getObject({
      Key: event.templateFilePath,
      Bucket: bucketName,
    }).promise(),
    s3.getObject({
      Key: event.recipientListFilePath,
      Bucket: bucketName,
    }).promise()
  ])

  const messageId = crypto.randomUUID();

  await db.putItem({
    TableName: messagesTableName,
    Item: {
      MessageId: {
        S: messageId,
      },
      Subject: {
        S: event.subject,
      }
    },
    ReturnValues: "NONE",
  }).promise()

  await Promise.all([
    s3.copyObject({
      CopySource: `${bucketName}/${event.templateFilePath}`,
      Bucket: bucketName,
      Key: `messages/${messageId}/template.html`, 
    }).promise(),
    s3.copyObject({
      CopySource: `${bucketName}/${event.recipientListFilePath}`,
      Bucket: bucketName,
      Key: `messages/${messageId}/recipients.json`, 
    }).promise()
  ]);

  return { messageId }
};
