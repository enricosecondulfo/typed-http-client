import { loadOpenApi } from "./utils";
import { ApiSchema, httpMethods } from "./types/api-schema";
import * as v from "valibot";
import type { OpenAPI, OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

type PathItemObject<T extends {}> =
  | OpenAPIV2.PathItemObject<T>
  | OpenAPIV3.PathItemObject<T>
  | OpenAPIV3_1.PathItemObject<T>;

const api = await loadOpenApi("specs/test-openapi.json");

const retrievePath = <T extends {}>(
  pathItemObject: PathItemObject<T>,
): string | undefined => {
  return httpMethods
    .map((method) => method.toLowerCase())
    .find((method) => pathItemObject[method]);
};

// console.log("api", Object.keys(api.paths!!));

const firstPath = api.paths!![Object.keys(api.paths!!)[0]];

const values = Object.entries(api.paths!).map(
  ([path, value]) => `@${retrievePath(value)?.toUpperCase()}${path}`,
);

const formattedPaths = values.map((value) => `"${value}": {}`);

const exportSchema = `export const apiSchema: ApiSchema = {${formattedPaths.join(",")}}`;

console.log(
  "values",
  (api.paths![Object.keys(api.paths!)[0]]!.get?.responses["200"] as any)
    .content["application/json"].schema,
);
// console.log("first key", value);
/* export const apiSchema: ApiSchema = {
   "@GET/test": {}
}; */
