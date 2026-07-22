import type { StandardSchemaV1 } from '@standard-schema/spec';
import { StructuredCloneNotFoundError } from './errors';
import { parseAsync, parseSync } from './utils';

export const defineValueObjectClass = <Schema extends StandardSchemaV1>(
    schema: Schema
) => {
    const modelSymbol = Symbol();

    class ValueObject {
        public static schema = schema;

        protected constructor(data: StandardSchemaV1.InferOutput<Schema>) {
            Object.defineProperty(this, modelSymbol, { value: data });
        }

        get model() {
            const thisWithSymbol = this as unknown as {
                [modelSymbol]: StandardSchemaV1.InferOutput<Schema>;
            };

            if (!('structuredClone' in globalThis)) {
                throw new StructuredCloneNotFoundError({});
            }

            return structuredClone(thisWithSymbol[modelSymbol]);
        }

        static create = (data: StandardSchemaV1.InferInput<Schema>) => {
            const parsedData = parseSync(schema, data);
            return new ValueObject(parsedData);
        };

        static createWithAsyncSchema = async (
            data: StandardSchemaV1.InferInput<Schema>
        ) => {
            const parsedData = await parseAsync(schema, data);
            return new ValueObject(parsedData);
        };
    }

    return ValueObject;
};

export type InferValueObjectSchema<T> = T extends { schema: StandardSchemaV1 }
    ? StandardSchemaV1.InferOutput<T['schema']>
    : T extends { model: infer M }
      ? M
      : never;
