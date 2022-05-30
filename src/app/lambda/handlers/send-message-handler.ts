import * as aws from '@pulumi/aws'
import crypto from 'node:crypto';

interface SendMessageEvent {
  messageId: string;
}

interface Recipient {
  email: string;
  [key: string]: any;
}

export const sendMessageHandler = async (event: SendMessageEvent): Promise<any> => {
  const s3 = new aws.sdk.S3()
  const db = new aws.sdk.DynamoDB()

  const { 
    bucketName, 
    messagesTableName, 
    pendingRecipientsTableName,
  } = process.env;

  if (!bucketName) {
    throw new Error('No bucket name was not provided in the environment.');
  }

  if (!messagesTableName) {
    throw new Error('No messages table name was not provided in the environment.');
  }

  if (!pendingRecipientsTableName) {
    throw new Error('No pending recipients table name was not provided in the environment.');
  }

  await db.updateItem({
    TableName: messagesTableName,
    Key: {
      MessageId: {
        S: event.messageId,
      }
    },
    UpdateExpression: 'SET SentAt = :sent_at',
    ExpressionAttributeValues: {
      ':sent_at': {
        S: new Date().toISOString(),
      }
    }
  }).promise()

  const recipientsFile = await s3.getObject({
    Key: `messages/${event.messageId}/recipients.json`,
    Bucket: bucketName,
  }).promise()

  if (!recipientsFile.Body) {
    throw new Error('Recipients file is empty.');
  }

  try {
    const BATCH_SIZE = 25;

    const recipientList: Recipient[] = JSON.parse(recipientsFile.Body.toString())
    const numberOfBatchWrites = Math.ceil(recipientList.length / BATCH_SIZE);
    const batchWritesArray = Array.from({ length: numberOfBatchWrites }, (_, i) => i);

    await Promise.all(batchWritesArray.map(async (batchIndex) => {
      const startFrom = batchIndex * BATCH_SIZE;

      const recipientListBatch = recipientList.slice(startFrom, BATCH_SIZE * (batchIndex + 1));

      const response = await db.batchWriteItem({
        RequestItems: {
          [pendingRecipientsTableName]: recipientListBatch.map(({ email, ...metadata }) => {
            return {
              PutRequest: {
                Item: {
                  RecipientId: {
                    S: crypto.randomUUID(),
                  },
                  MessageId: {
                    S: event.messageId,
                  },
                  Email: {
                    S: email,
                  },
                }
              }
            }
          })
        },
        ReturnConsumedCapacity: "TOTAL",
      }).promise()

      console.log(JSON.stringify(response.ConsumedCapacity));
    }))
  } catch (err) {
    console.log(err);
    throw new Error('Error parsing recipients file (JSON).')
  }
};
