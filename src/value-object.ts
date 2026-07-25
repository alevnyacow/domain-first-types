import type { StandardSchemaV1 } from '@standard-schema/spec';
import { type DeepReadonly, parseSync } from './utils';

const createValueObject = <Schema extends StandardSchemaV1>(
    getSchema: (isCurrentValueObject: (target: unknown) => boolean) => Schema
) => {
    const modelSymbol = Symbol();
    const classSymbol = Symbol();

    const isThisClass = (target: unknown): boolean => {
        return !!target && typeof target === 'object' && classSymbol in target;
    };

    abstract class ValueObject {
        public static readonly schema = getSchema(isThisClass);

        constructor(data: StandardSchemaV1.InferInput<Schema>) {
            const parsedData = parseSync(ValueObject.schema, data);

            Object.defineProperty(this, modelSymbol, {
                value: parsedData
            });

            Object.defineProperty(this, classSymbol, {
                value: true
            });
        }

        get model() {
            const thisWithSymbol = this as unknown as {
                [modelSymbol]: StandardSchemaV1.InferOutput<Schema>;
            };

            return thisWithSymbol[modelSymbol] as DeepReadonly<
                StandardSchemaV1.InferOutput<Schema>
            >;
        }
    }

    return ValueObject;
};

export const defineValueObject = <Schema extends StandardSchemaV1>(
    schema: Schema
) => {
    return createValueObject(() => schema);
};

export const defineRecursiveValueObject = <Schema extends StandardSchemaV1>(
    schema: (isCurrentValueObject: (target: unknown) => boolean) => Schema
) => {
    return createValueObject(schema);
};

export type InferValueObjectSchema<T> = T extends {
    schema: infer S extends StandardSchemaV1;
}
    ? StandardSchemaV1.InferOutput<S>
    : T extends { model: infer M }
      ? M
      : never;
