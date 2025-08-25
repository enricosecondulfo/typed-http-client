import type { HttpResourceRequest } from "@angular/common/http";
import { HttpParams } from "@angular/common/http";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import type {
  ApiSchema,
  HttpMethod,
  ResolveOriginalKey,
  RouteKey,
} from "./types/api-schema";
import type { FetchOptions } from "./types/http-typed-options";
import { isStandardSchemaV1, validateWithSchema } from "./utils";

export const buildHttpRequest = <
  TSchema extends ApiSchema,
  TMethod extends HttpMethod,
  TRoute extends RouteKey<TSchema, TMethod>,
>(
  baseUrl: string,
  method: TMethod,
  route: TRoute,
  endpoint: TSchema[ResolveOriginalKey<TSchema, TMethod, TRoute>],
  fetchOptions?: FetchOptions<TSchema, TMethod, TRoute>,
): HttpResourceRequest => {
  const url = buildUrl(baseUrl, route, endpoint?.params, fetchOptions?.params);

  const params = fetchOptions?.query
    ? toHttpParams(fetchOptions?.query, endpoint?.query as StandardSchemaV1)
    : undefined;

  const headers = fetchOptions?.headers;

  const body =
    endpoint?.input != null && isStandardSchemaV1(endpoint.input)
      ? validateWithSchema(endpoint.input, fetchOptions?.body, "input")
      : fetchOptions?.body;

  return {
    url,
    method,
    body,
    params,
    headers,
  };
};

const buildUrl = (
  baseUrl: string,
  route: string,
  schema?: StandardSchemaV1,
  params?: unknown,
): string => {
  debugger;
  const url = `${baseUrl}${route}`;

  const validatedParams = (
    schema && isStandardSchemaV1(schema)
      ? validateWithSchema(schema, params, "params")
      : params
  ) as Record<string, unknown>;

  return validatedParams != null
    ? Object.entries(validatedParams).reduce(
        (acc, [key, value]) =>
          acc.replace(
            new RegExp(`:${key}(?:::[a-zA-Z]+)?`),
            encodeURIComponent(String(value)),
          ),
        url,
      )
    : url;
};

const toHttpParams = (
  query: Record<string, unknown>,
  schema?: StandardSchemaV1,
): HttpParams | undefined => {
  const validatedParams = (
    schema && isStandardSchemaV1(schema)
      ? validateWithSchema(schema, query, "query")
      : query
  ) as Record<string, unknown>;

  const normalizedParams = Object.entries(validatedParams).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: Array.isArray(value) ? value : String(value),
    }),
    {},
  );

  return new HttpParams({ fromObject: normalizedParams });
};
