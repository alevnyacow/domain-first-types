import type { StandardSchemaV1 } from '@standard-schema/spec';
import { type DeepReadonly, parseSync } from './utils';

const createDomainType = <ModelSchema extends StandardSchemaV1>(
    getModelSchema: (
        isCurrentEntity: (target: unknown) => boolean
    ) => ModelSchema
) => {
    const classSymbol = Symbol();

    const isInstanceOfThisType = (target: unknown): boolean => {
        return !!target && typeof target === 'object' && classSymbol in target;
    };

    class DomainType {
        public static readonly schema = getModelSchema(isInstanceOfThisType);

        snapshot(): StandardSchemaV1.InferOutput<ModelSchema> {
            // @ts-expect-error hidden field
            const model: StandardSchemaV1.InferInput<ModelSchema> = this._model;

            return model;
        }

        with(changes: Partial<StandardSchemaV1.InferInput<ModelSchema>>): this {
            const Constructor = this.constructor as new (
                model: StandardSchemaV1.InferInput<ModelSchema>
            ) => this;

            return new Constructor({
                ...(this.snapshot() as object),
                ...changes
            } as StandardSchemaV1.InferInput<ModelSchema>);
        }

        constructor(model: StandardSchemaV1.InferInput<ModelSchema>) {
            const schema = (this.constructor as typeof DomainType).schema;

            const parsedModelData = parseSync(schema, model);

            Object.defineProperty(this, '_model', {
                value: parsedModelData,
                configurable: false
            });

            if (parsedModelData && typeof parsedModelData === 'object') {
                for (const [key, value] of Object.entries(parsedModelData)) {
                    Object.defineProperty(this, key, {
                        value,
                        writable: false,
                        configurable: false,
                        enumerable: true
                    });
                }
            } else {
                Object.defineProperty(this, 'value', {
                    value: parsedModelData,
                    writable: false,
                    configurable: false,
                    enumerable: true
                });
            }

            Object.defineProperty(this, classSymbol, {
                value: true,
                writable: false,
                configurable: false
            });
        }
    }

    return DomainType as unknown as (abstract new (
        model: StandardSchemaV1.InferInput<ModelSchema>
    ) => DeepReadonly<
        StandardSchemaV1.InferOutput<ModelSchema> extends object
            ? StandardSchemaV1.InferOutput<ModelSchema>
            : {
                  value: StandardSchemaV1.InferOutput<ModelSchema>;
              }
    > &
        (StandardSchemaV1.InferOutput<ModelSchema> extends object
            ? {
                  snapshot: () => StandardSchemaV1.InferOutput<ModelSchema>;
                  with: <Instance>(
                      this: Instance,
                      changes: Partial<StandardSchemaV1.InferInput<ModelSchema>>
                  ) => Instance;
              }
            : {})) & {
        schema: ModelSchema;
    };
};

export const domainType = <ModelSchema extends StandardSchemaV1>(
    modelSchema: ModelSchema
) => {
    return createDomainType(() => modelSchema);
};

export const recursiveDomainType = <ModelSchema extends StandardSchemaV1>(
    modelSchema: (isCurrentType: (target: unknown) => boolean) => ModelSchema
) => {
    return createDomainType(modelSchema);
};
