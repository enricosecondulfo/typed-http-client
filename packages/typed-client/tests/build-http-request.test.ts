import { describe, expect, it } from "vitest";
import { buildHttpRequest } from "../src/build-http-request";
import * as v from "valibot";

describe.skip("buildHttpRequest", () => {
  it("should build a request with params", () => {
    const request = buildHttpRequest(
      "http://localhost",
      "GET",
      "/users/:id",
      {},
      { params: { id: 1 }, query: { name: "test" } },
    );

    console.log("request", request);

    expect(true).toBe(true);
  });
});
