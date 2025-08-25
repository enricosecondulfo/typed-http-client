import fs from "fs/promises";
import yaml from "js-yaml";
import swaggerParser from "@apidevtools/swagger-parser";
import { type OpenAPI } from "openapi-types";

const isYaml = (path: string) =>
  path.endsWith(".yaml") || path.endsWith(".yml");

export const loadOpenApi = async (path: string): Promise<OpenAPI.Document> => {
  try {
    const content = await fs.readFile(path, "utf8");
    const openApi = isYaml(path) ? yaml.load(content) : JSON.parse(content);

    return swaggerParser.dereference(openApi);
  } catch (e) {
    console.log("error");
    return Promise.reject();
  }
};
