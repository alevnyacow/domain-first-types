import type { StandardSchemaV1 } from '@standard-schema/spec';
import { type DeepReadonly, parseSync } from './utils';

export const defineEntity = <
    IdSchema extends StandardSchemaV1,
    ModelSchema extends StandardSchemaV1
>(
    idSchema: IdSchema,
    modelSchema:
        | ModelSchema
        | ((isCurrentEntity: (target: unknown) => boolean) => ModelSchema)
) => {
    const idSymbol = Symbol();
    const modelSymbol = Symbol();
    const classSymbol = Symbol();

    const isThisClass = (target: unknown): boolean => {
        return !!target && typeof target === 'object' && classSymbol in target;
    };

    abstract class Entity {
        public static readonly idSchema = idSchema;
        public static readonly modelSchema =
            typeof modelSchema === 'function'
                ? modelSchema(isThisClass)
                : modelSchema;

        constructor(
            id: StandardSchemaV1.InferOutput<IdSchema>,
            model: StandardSchemaV1.InferOutput<ModelSchema>
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
            const thisWithSymbol = this as unknown as {
                [modelSymbol]: StandardSchemaV1.InferOutput<ModelSchema>;
            };

            return thisWithSymbol[modelSymbol] as DeepReadonly<
                StandardSchemaV1.InferOutput<ModelSchema>
            >;
        }

        get id() {
            const thisWithSymbol = this as unknown as {
                [idSymbol]: StandardSchemaV1.InferOutput<IdSchema>;
            };

            return thisWithSymbol[idSymbol] as DeepReadonly<
                StandardSchemaV1.InferOutput<IdSchema>
            >;
        }
    }

    return Entity;
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
