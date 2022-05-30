import * as aws from "@pulumi/aws";

export const messagesTable = new aws.dynamodb.Table("messages", {
    attributes: [
      {
        name: "MessageId",
        type: "S",
      },
    ],
    billingMode: "PAY_PER_REQUEST",
    hashKey: "MessageId",
});

