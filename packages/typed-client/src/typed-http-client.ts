import { HttpClient, type HttpResourceRequest } from "@angular/common/http";
import { inject, Injector } from "@angular/core";
import { buildHttpRequest } from "./build-http-request";
import {
  type ApiSchema,
  type HttpMethod,
  type ResolveOriginalKey,
  type RouteImplicit,
  type RouteKey,
} from "./types/api-schema";
import type { FetchOptions } from "./types/http-typed-options";
import type { InferOutput } from "./types/inference-helpers";

export type TypedHttpClientOptions<TSchema extends ApiSchema> = {
  baseURL: string;
  schema: TSchema;
  injector?: Injector;
};

export class TypedHttpClient<TSchema extends ApiSchema> {
  #options!: TypedHttpClientOptions<TSchema>;
  #httpClient!: HttpClient;

  constructor(options: TypedHttpClientOptions<TSchema>, injector?: Injector) {
    const inj = injector || options.injector || inject(Injector);

    this.#options = options;
    this.#httpClient = inj.get(HttpClient);
  }

  request<
    TMethod extends HttpMethod,
    TRoute extends RouteKey<TSchema, TMethod>,
  >(
    method: TMethod,
    route: TRoute,
    fetchOptions?: FetchOptions<TSchema, TMethod, TRoute> & {
      baseUrl?: string;
    },
  ) {
    const endpointDefition =
      this.#options.schema[`${route}` as RouteImplicit] ||
      this.#options.schema[`@${method}/${route.replace("/", "")}`];

    if (!endpointDefition) {
      throw new Error(`Route "${route}" is not defined in the API schema.`);
    }

    const req: HttpResourceRequest = buildHttpRequest(
      this.#options.baseURL || fetchOptions?.baseUrl || "",
      method,
      route,
      endpointDefition as TSchema[ResolveOriginalKey<TSchema, TMethod, TRoute>],
      fetchOptions,
    );

    return this.#httpClient.request<InferOutput<TSchema[TRoute]>>(
      req.method! satisfies string,
      req.url,
      {
        body: req.body,
        headers: req.headers as any,
        params: req.params,
        responseType: "json",
      },
    );
  }
}
