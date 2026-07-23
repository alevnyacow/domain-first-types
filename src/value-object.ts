import type { StandardSchemaV1 } from '@standard-schema/spec';
import { type DeepReadonly, parseSync } from './utils';

export abstract class S<Schema extends StandardSchemaV1> {
    abstract schema: Schema;
}

export const defineValueObjectClass = <Schema extends StandardSchemaV1>(
    schema:
        | Schema
        | ((isCurrentValueObject: (target: unknown) => boolean) => Schema)
) => {
    const modelSymbol = Symbol();
    const classSymbol = Symbol();

    const isThisClass = (target: unknown): boolean => {
        return !!target && typeof target === 'object' && classSymbol in target;
    };

    class ValueObject {
        public static readonly schema =
            typeof schema === 'function' ? schema(isThisClass) : schema;

        constructor(data: StandardSchemaV1.InferOutput<Schema>) {
            const parsedData = parseSync(ValueObject.schema, data);

            Object.defineProperty(this, modelSymbol, {
                value: parsedData
            });
            Object.defineProperty(this, classSymbol, { value: true });
        }

        static is = (target: unknown): boolean => {
            return isThisClass(target);
        };

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

export type InferValueObjectSchema<T> = T extends { schema: StandardSchemaV1 }
    ? StandardSchemaV1.InferOutput<T['schema']>
    : T extends { model: infer M }
      ? M
      : never;
