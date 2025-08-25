import type { StandardSchemaV1 } from "@standard-schema/spec";

const inputTypesToValidate = ["params", "query", "input", "output"] as const;

type InputTypesToValidate = (typeof inputTypesToValidate)[number];

export const isStandardSchemaV1 = (
  schema: unknown,
): schema is StandardSchemaV1 =>
  schema != null && typeof schema === "object" && "~standard" in schema;

export const validateWithSchema = <TSchema extends StandardSchemaV1>(
  schema: TSchema,
  value: unknown,
  inputTypeToValidate: InputTypesToValidate | "unknown" = "unknown",
): StandardSchemaV1.InferOutput<TSchema> => {
  const result = schema["~standard"].validate(value);

  if (result instanceof Promise) {
    throw new Error("Async validation not supported in this helper.");
  }

  if ("issues" in result) {
    throw new Error(
      `Request ${inputTypeToValidate} validation failed: ${JSON.stringify(result.issues, null, 2)}`,
    );
  }

  return result.value;
};
