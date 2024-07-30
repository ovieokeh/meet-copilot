import { Client } from "@notionhq/client";
import { SearchResponse } from "@notionhq/client/build/src/api-endpoints";

import { NotionGetDocumentParams, NotionSearchParams } from "../types";

export async function searchNotion({
  query,
  accessToken,
}: NotionSearchParams): Promise<Partial<SearchResponse>> {
  if (!accessToken)
    throw new Error("Notion access is required to search Notion");
  const notionInstance = new Client({ auth: accessToken });

  const isMultipleWords = query.split(" ").length > 1;

  let multipleWordSearchPromises: Promise<SearchResponse>[] = [];
  if (isMultipleWords) {
    const words = query.split(" ");
    multipleWordSearchPromises = words.map((word) =>
      notionInstance.search({
        query: word,
        filter: {
          value: "page",
          property: "object",
        },
      }),
    );
    const responses = await Promise.all(multipleWordSearchPromises);
    const deduplicatedResults = responses
      .map((response) => response.results)
      .flat()
      .reduce((acc, response) => {
        if (!acc.some((accResult: any) => accResult.id === response.id)) {
          acc.push(response);
        }
        return acc;
      }, [] as any[]);

    return { results: deduplicatedResults };
  }

  const response = await notionInstance.search({
    query,
    filter: {
      value: "page",
      property: "object",
    },
  });

  return response;
}

export async function getNotionDocument({
  id,
  accessToken,
}: NotionGetDocumentParams) {
  if (!accessToken)
    throw new Error("Notion access is required to search Notion");
  const notionInstance = new Client({ auth: accessToken });

  const pageInfo = (await notionInstance.pages.retrieve({ page_id: id })) ?? {};

  const isIdUuid = id.length === 32 && !id.includes(" ");
  if (!isIdUuid || !pageInfo?.id) {
    const foundId = (await searchNotion({ query: id, accessToken }))
      .results?.[0]?.id;
    if (!foundId) {
      throw new Error(`Document not found with id: ${id}`);
    }
    id = foundId;
  }

  const pageBlocks = await notionInstance.blocks.children
    .list({
      block_id: id,
    })
    .catch(() => {
      return { error: "Error fetching page blocks with id: " + id };
    });

  return {
    pageInfo,
    pageBlocks,
  };
}

export async function updateNotionDocument({
  id,
  accessToken,
  properties,
}: {
  id: string;
  accessToken: string;
  properties: any;
}) {
  if (!accessToken)
    throw new Error("Notion access is required to search Notion");
  const notionInstance = new Client({ auth: accessToken });
  const response = await notionInstance.pages.update({
    page_id: id,
    properties,
  });
  return response;
}
