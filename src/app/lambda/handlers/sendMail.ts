import { SQSEvent, SQSBatchResponse } from "aws-lambda";
import * as aws from "@pulumi/aws";

export const sendMailHandler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  const ses = new aws.sdk.SES()

  console.log('Records');
  console.log(event.Records.length);
  console.log(event.Records);

  const result = await Promise.all(event.Records.map(async message => {
    try {
      // const mailMessage = await ses.sendEmail({
      //   Destination: {
      //     ToAddresses: [
      //       'Diego Fernandes <diego.schell.f@gmail.com>'
      //     ]
      //   },
      //   Source: 'Diego Fernandes <diego@rocketseat.com.br>',
      //   Message: {
      //     Subject: {
      //       Data: 'Teste de e-mail (Lambda)'
      //     },
      //     Body: {
      //       Text: {
      //         Data: `Esse é um teste de e-mail: ${message.body}`
      //       }
      //     }
      //   }
      // }).promise()

      // console.log(`Message: ${message.body}`);
  
      return {
        status: 'sent',
        queueMessageId: message.messageId,
        // mailMessageId: mailMessage.MessageId
      }
    } catch (err) {
      console.log(err);

      return {
        status: 'error',
        queueMessageId: message.messageId,
      }
    }
  }))

  const response: SQSBatchResponse = {
    batchItemFailures: result
    .filter(resultItem => resultItem.status === 'error')
    .map(resultItem => {
      return {
        itemIdentifier: resultItem.queueMessageId,
      }
    }),
  }

  return response;
};
