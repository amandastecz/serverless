import { APIGatewayProxyHandler } from "aws-lambda";
import { document } from "../utils/dynamoDBClient";
import * as Handlebars from "handlebars";
import { join } from "path";
import { readFileSync } from "fs";

interface ICreateCertificate {
    id: string,
    name: string,
    grade: string
}

interface ITemplate {
    id: string,
    name: string,
    grade: string,
    medal: string,
    date: string,
}

const compileTemplate = (data: ITemplate) => {
    const filePath = join(process.cwd(), "src", "templates", "certificate.hbs");
    const html = readFileSync(filePath, "utf-8");
    return Handlebars.compile(html)(data);
}

export const handler: APIGatewayProxyHandler = async (event) => {
    const {id, name, grade} = JSON.parse(event.body) as ICreateCertificate;
    await document.put({
        TableName: "users_certificate",
        Item: {
            id,
            name,
            grade,
            created_at: new Date().getTime(),
        }
    }).promise();
    const response = await document.query({
        TableName: "users_certificate",
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues:{
            ":id": id
        }
    }).promise();
    return {
        statusCode: 201,
        body: JSON.stringify(response.Items[0]),
    }
}