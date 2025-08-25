import type { HttpHeaders } from "@angular/common/http";
import type {
  ApiSchema,
  EndpointDefinition,
  HttpMethod,
  ResolveOriginalKey,
  RouteKey,
} from "./api-schema";
import type { InferInput, InferParams, InferQuery } from "./inference-helpers";

export type HttpTypedOptions<TEndpointDef extends EndpointDefinition> = {
  body?: InferInput<TEndpointDef>;
  query?: InferQuery<TEndpointDef>;
  params?: InferParams<TEndpointDef>;
  method?: HttpMethod;
  headers?: HttpHeaders | Record<string, string | string[]>;
};

export type FetchOptions<
  TSchema extends ApiSchema,
  TMethod extends HttpMethod,
  TRoute extends RouteKey<TSchema, TMethod>,
> = HttpTypedOptions<TSchema[ResolveOriginalKey<TSchema, TMethod, TRoute>]>;
