import { NotionGetDocumentParams, NotionSearchParams } from "../types";

import { getNotionDocument, searchNotion } from "./notion-controller";

const AI_FUNCTIONS_CONTROLLER = {
  notion: {
    search: async (args: NotionSearchParams) => {
      const searchResults = await searchNotion(args);
      return searchResults;
    },
    getDocument: async (args: NotionGetDocumentParams) => {
      const document = await getNotionDocument(args);
      return document;
    },
  },
};

export default AI_FUNCTIONS_CONTROLLER;
