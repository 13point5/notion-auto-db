import { Client } from "@notionhq/client";
import Instructor from "@instructor-ai/instructor";
import OpenAI from "openai";
import { z } from "zod";
import {
  CreatePageParameters,
  DatabaseObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

const stringTypes = ["rich_text", "title", "url"];

const getUrlContent = async (url: string) => {
  const res = await fetch(`https://r.jina.ai/${url}`);
  const pageContent = await res.text();

  return pageContent;
};

const getDbTitle = (db: DatabaseObjectResponse) => {
  const firstTextNode = (db.title || []).find((item) => item.type === "text");

  if (firstTextNode?.type === "text") return firstTextNode.text.content;

  return "";
};

function extractDbIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const id = path.split("/")[1];
    return id || null;
  } catch (error) {
    console.error("Invalid URL:", error);
    return null;
  }
}

export async function POST(request: Request) {
  const req = await request.json();

  const { databaseUrl, openAiKey, notionKey, model, url } = req;

  const databaseId = extractDbIdFromUrl(databaseUrl);

  if (!databaseId) throw new Error("Couldn't extract Notion database ID");

  const openaiClient = new OpenAI({
    apiKey: openAiKey,
  });

  const instructorClient = Instructor({
    client: openaiClient,
    mode: "FUNCTIONS",
  });

  const notion = new Client({
    auth: notionKey,
  });

  const [pageContent, notionDb] = await Promise.all([
    getUrlContent(url),
    notion.databases.retrieve({
      database_id: databaseId,
    }),
  ]);

  const { properties } = notionDb;

  const title = getDbTitle(notionDb as DatabaseObjectResponse);

  const schema: {
    [key: string]: any;
  } = {};

  Object.values(properties).forEach((prop) => {
    if (!prop.name) return;

    if (stringTypes.includes(prop.type)) {
      schema[prop.name] = z.string();
    }

    if (prop.type === "number") {
      schema[prop.name] = z.number();
    }

    if (prop.type === "checkbox") {
      schema[prop.name] = z.boolean().nullish();
    }

    if (prop.type === "select") {
      const options = prop.select.options.map((item) => item.name);
      schema[prop.name] = z.enum([options[0], ...options.slice(1)]);
    }

    if (prop.type === "multi_select") {
      const options = prop.multi_select.options.map((item) => item.name);
      schema[prop.name] = z.array(z.enum([options[0], ...options.slice(1)]));
    }
  });

  const zodSchema = z.object(schema);

  const res = await instructorClient.chat.completions.create({
    messages: [{ role: "user", content: pageContent }],
    model,
    response_model: {
      schema: zodSchema,
      name: title,
    },
    max_retries: 5,
  });

  const row: CreatePageParameters = {
    parent: {
      type: "database_id",
      database_id: databaseId,
    },
    properties: {},
  };

  Object.values(properties).forEach((prop) => {
    const { name, type } = prop;
    const value = res[name];

    if (!name || !res) return;

    if (type === "rich_text") {
      row.properties[name] = {
        type,
        [type]: [
          {
            text: {
              content: value,
            },
          },
        ],
      };
    }

    if (type === "title") {
      row.properties[name] = {
        type,
        [type]: [
          {
            text: {
              content: value,
            },
          },
        ],
      };
    }

    if (type === "url") {
      row.properties[name] = {
        type,
        [type]: value,
      };
    }

    if (type === "number") {
      row.properties[name] = {
        type,
        [type]: value,
      };
    }

    if (type === "checkbox") {
      row.properties[name] = {
        type,
        [type]: Boolean(value),
      };
    }

    if (type === "select") {
      row.properties[name] = {
        type,
        [type]: {
          name: value,
        },
      };
    }

    if (type === "multi_select") {
      const options = (value as string[]).map((item) => ({ name: item }));

      row.properties[name] = {
        type,
        [type]: options,
      };
    }
  });

  const result = await notion.pages.create(row);

  return Response.json({
    result,
  });
}
