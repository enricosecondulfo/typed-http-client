import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { Injector, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { lastValueFrom } from "rxjs";
import * as v from "valibot";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { TypedHttpClient } from "../src/typed-http-client";
import type { ApiSchema } from "../src/types/api-schema";

/* define api schema */
const GetUserParamsSchema = v.object({
  id: v.number(),
});

const GetUserQuerySchema = v.object({
  name: v.string(),
});

const UserOutputSchema = v.object({
  name: v.string(),
});

const apiSchema = {
  "/users": {
    output: UserOutputSchema,
  },
  "/users/:id": {
    params: GetUserParamsSchema,
    query: GetUserQuerySchema,
    output: UserOutputSchema,
  },
} satisfies ApiSchema;

describe("typedHttpClient", () => {
  let client: TypedHttpClient<typeof apiSchema>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
  });

  beforeEach(() => {
    client = new TypedHttpClient(
      { baseURL: "", schema: apiSchema },
      TestBed.inject(Injector),
    );
  });

  afterEach(() => {
    const httpTesting = TestBed.inject(HttpTestingController);
    httpTesting.verify();
  });

  test("should handle GET request with parameterized URL", () => {
    const httpTesting = TestBed.inject(HttpTestingController);

    TestBed.runInInjectionContext(async () => {
      const result$ = client.request("GET", "/users/:id", {
        params: { id: 1 },
      });

      const resultPromise = lastValueFrom(result$);

      const req = httpTesting.expectOne(
        "/users/1",
        "Request to load user with specific id",
      );

      const body = { name: "Vera Denner" };

      req.flush(body);

      expect(req.request.method).toBe("GET");
      expect(await resultPromise).toEqual({ name: "Vera Denner" });
    });
  });
});
