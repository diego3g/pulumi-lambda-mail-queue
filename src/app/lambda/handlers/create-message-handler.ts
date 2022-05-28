import * as aws from '@pulumi/aws'

interface CreateMessageEvent {
  from: string;
  subject: string;
  templateFilePath: string;
  recipientListFilePath: string;
}

export const createMessageHandler = async (event: CreateMessageEvent): Promise<any> => {
  const s3 = new aws.sdk.S3()
  const lambda = new aws.sdk.Lambda()

  if (!process.env.bucketName) {
    throw new Error('The bucket name was not provided in the environment.');
  }

  await Promise.all([
    s3.headObject({
      Key: event.templateFilePath,
      Bucket: process.env.bucketName,
    }).promise(),
    s3.headObject({
      Key: event.recipientListFilePath,
      Bucket: process.env.bucketName,
    }).promise()
  ])

  // const template = JSON.parse(templateFile.Body?.toString() ?? '{}')
  // const recipients = JSON.parse(recipientList.Body?.toString() ?? '{}')

  await lambda.invokeAsync({
    FunctionName: '',
    InvokeArgs: {},
  }).promise()
};
