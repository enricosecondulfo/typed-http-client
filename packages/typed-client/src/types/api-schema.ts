import type { StandardSchemaV1 } from "@standard-schema/spec";

type StringKeyOf<T> = Extract<keyof T, string>;

export const httpMethods = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
] as const;

export type HttpMethod = (typeof httpMethods)[number];

export type RouteImplicit = `/${string}`;
type RouteWithMethod = `@${HttpMethod}/${string}`;
type Route = RouteImplicit | RouteWithMethod;

export type EndpointDefinition<
  Input = unknown,
  Output = unknown,
  Query = unknown,
  Params = unknown,
> = {
  input?: StandardSchemaV1<Input, Input> | Input;
  output?: StandardSchemaV1<unknown, Output> | Output;
  query?: StandardSchemaV1<Query, Query> | Query;
  params?: StandardSchemaV1<Params, Params>;
};

export type ApiSchema<
  TSchema extends Record<Route, EndpointDefinition> = Record<
    Route,
    EndpointDefinition
  >,
> = TSchema;

/**
 * Extracts the path from route keys, removing HTTP method prefix if present.
 * @template TSchema - The API schema type.
 * @example For schema { "@GET/orders": {}, "/users": {} }, yields "/orders" | "/users".
 */
export type ExtractPath<TSchema extends ApiSchema> = {
  [K in StringKeyOf<TSchema>]: K extends `@${HttpMethod}/${infer P}`
    ? `/${P}`
    : K;
}[StringKeyOf<TSchema>];

/**
 * Extracts the HTTP method from a route key, defaulting to "GET" for implicit routes.
 * @template TKey - The route key as a string.
 * @example "@POST/products" -> "POST", "/users" -> "GET".
 */
export type ExtractMethod<TKey extends string> =
  TKey extends `@${infer TMethod}/${string}`
    ? TMethod extends HttpMethod
      ? TMethod
      : never
    : "GET";

/**
 * Filters and transforms route keys based on the specified HTTP method, returning transformed paths.
 * @template TSchema - The API schema type.
 * @template TMethod - The HTTP method to filter by.
 * @example For schema { "@GET/orders": {}, "/users": {} } and TMethod = "GET", yields "/orders" | "/users".
 */
export type RouteKey<
  TSchema extends ApiSchema,
  TMethod extends HttpMethod = HttpMethod,
> = {
  [TKey in StringKeyOf<TSchema>]: ExtractMethod<TKey> extends TMethod
    ? TKey extends `@${HttpMethod}/${infer P}`
      ? `/${P}`
      : TKey
    : never;
}[StringKeyOf<TSchema>];

/**
 * Resolves a transformed route path and method to the original schema key.
 * @template TSchema - The API schema type.
 * @template TMethod - The HTTP method type.
 * @template TRoute - The transformed route path type.
 * @example For TRoute = "/users/:id", TMethod = "GET", yields "@GET/users/:id" or "/users/:id".
 */
export type ResolveOriginalKey<
  TSchema extends ApiSchema,
  TMethod extends HttpMethod,
  TRoute extends RouteKey<TSchema, TMethod>,
> = TRoute extends `/${infer P}`
  ? TMethod extends "GET"
    ? `/${P}` extends StringKeyOf<TSchema>
      ? `/${P}`
      : `@${TMethod}/${P}` extends StringKeyOf<TSchema>
        ? `@${TMethod}/${P}`
        : never
    : `@${TMethod}/${P}` extends StringKeyOf<TSchema>
      ? `@${TMethod}/${P}`
      : never
  : never;

export const isHttpMethod = (value: string): value is HttpMethod =>
  httpMethods.includes(value.toUpperCase() as HttpMethod);

const c = {
  "@POST/products": {},
} satisfies ApiSchema;

const test = <T extends ApiSchema>(schema: T, input: RouteKey<T, "POST">) => {};

test(c, "/products");
