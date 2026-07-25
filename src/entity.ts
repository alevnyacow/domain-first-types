import type { StandardSchemaV1 } from '@standard-schema/spec';
import { type DeepReadonly, parseSync } from './utils';

const createEntity = <
    IdSchema extends StandardSchemaV1,
    ModelSchema extends StandardSchemaV1
>(
    idSchema: IdSchema,
    getModelSchema: (
        isCurrentEntity: (target: unknown) => boolean
    ) => ModelSchema
) => {
    const idSymbol = Symbol();
    const modelSymbol = Symbol();
    const classSymbol = Symbol();

    const isThisClass = (target: unknown): boolean => {
        return !!target && typeof target === 'object' && classSymbol in target;
    };

    abstract class Entity {
        public static readonly idSchema = idSchema;
        public static readonly modelSchema = getModelSchema(isThisClass);

        constructor(
            id: StandardSchemaV1.InferInput<IdSchema>,
            model: StandardSchemaV1.InferInput<ModelSchema>
        ) {
            const parsedId = parseSync(Entity.idSchema, id);
            const parsedModelData = parseSync(Entity.modelSchema, model);

            Object.defineProperty(this, idSymbol, {
                value: parsedId
            });

            Object.defineProperty(this, modelSymbol, {
                value: parsedModelData
            });

            Object.defineProperty(this, classSymbol, {
                value: true
            });
        }

        get model() {
            return (this as any)[modelSymbol] as DeepReadonly<
                StandardSchemaV1.InferOutput<ModelSchema>
            >;
        }

        get id() {
            return (this as any)[idSymbol] as DeepReadonly<
                StandardSchemaV1.InferOutput<IdSchema>
            >;
        }
    }

    return Entity;
};

export const defineEntity = <
    IdSchema extends StandardSchemaV1,
    ModelSchema extends StandardSchemaV1
>(
    idSchema: IdSchema,
    modelSchema: ModelSchema
) => {
    return createEntity(idSchema, () => modelSchema);
};

export const defineRecursiveEntity = <
    IdSchema extends StandardSchemaV1,
    ModelSchema extends StandardSchemaV1
>(
    idSchema: IdSchema,
    modelSchema: (isCurrentEntity: (target: unknown) => boolean) => ModelSchema
) => {
    return createEntity(idSchema, modelSchema);
};

export type InferEntityModel<T> = T extends { modelSchema: StandardSchemaV1 }
    ? StandardSchemaV1.InferOutput<T['modelSchema']>
    : T extends { model: infer M }
      ? M
      : never;

export type InferEntityId<T> = T extends { idSchema: StandardSchemaV1 }
    ? StandardSchemaV1.InferOutput<T['idSchema']>
    : T extends { id: infer M }
      ? M
      : never;
