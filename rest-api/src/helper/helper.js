import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../utils/db.js";

const USERS_TABLE = process.env.USERS_TABLE;

export default async function checkUserByEmail(email) {
  if (!email) return false;
  const params = {
    TableName: USERS_TABLE,
    IndexName: "email-index",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: { ":email": email },
    Limit: 1,
  };
  try {
    const command = new QueryCommand(params);
    const { Items } = await docClient.send(command);
    return Items && Items.length > 0 ?Items[0]?.email : null;
  } catch (error) {
    console.error("checkUserByEmail error:", error);
    throw error;
  }
}
