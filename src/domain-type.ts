import type { StandardSchemaV1 } from '@standard-schema/spec';
import { DirectConstructionError } from './errors';
import {
    type DataFields,
    type DeepReadonly,
    type HasFields,
    parseSync
} from './utils';

const modelSymbol: unique symbol = Symbol('model');

/**
 * Not exported: only code in this module can call domain type constructors.
 */
const constructorToken: unique symbol = Symbol('constructor');

type DomainInstance<ModelSchema extends StandardSchemaV1> = {
    readonly snapshot: StandardSchemaV1.InferOutput<ModelSchema>;
    of: <Instance>(
        this: Instance,
        update: (
            current: StandardSchemaV1.InferOutput<ModelSchema>
        ) => StandardSchemaV1.InferInput<ModelSchema>
    ) => Instance;
} & (HasFields<StandardSchemaV1.InferOutput<ModelSchema>> extends true
    ? DeepReadonly<DataFields<StandardSchemaV1.InferOutput<ModelSchema>>> & {
          with: <Instance>(
              this: Instance,
              changes: Partial<StandardSchemaV1.InferInput<ModelSchema>>
          ) => Instance;
      }
    : {});

/**
 * A named type literal, so that the `@deprecated` tag on the constructor
 * survives formatting and declaration emit.
 */
type DomainClass<ModelSchema extends StandardSchemaV1> = {
    /**
     * @deprecated Use `Class.of()` instead: the constructor is private.
     */
    new (
        privateConstructor: typeof constructorToken,
        model: StandardSchemaV1.InferInput<ModelSchema>
    ): DomainInstance<ModelSchema>;
    schema: ModelSchema;
    of: <Class extends abstract new (...args: any) => any>(
        this: Class,
        model: StandardSchemaV1.InferInput<ModelSchema>
    ) => InstanceType<Class>;
};

const createDomainType = <ModelSchema extends StandardSchemaV1>(
    getModelSchema: (
        isCurrentEntity: (target: unknown) => boolean
    ) => ModelSchema
): DomainClass<ModelSchema> => {
    const classSymbol = Symbol();

    const isInstanceOfThisType = (target: unknown): boolean => {
        return !!target && typeof target === 'object' && classSymbol in target;
    };

    class DomainType {
        public static readonly schema = getModelSchema(isInstanceOfThisType);

        private declare readonly [modelSymbol]: StandardSchemaV1.InferOutput<ModelSchema>;

        get snapshot(): StandardSchemaV1.InferOutput<ModelSchema> {
            return this[modelSymbol];
        }

        static of<Instance>(
            this: new (
                privateConstructor: typeof constructorToken,
                model: StandardSchemaV1.InferInput<ModelSchema>
            ) => Instance,
            model: StandardSchemaV1.InferInput<ModelSchema>
        ): Instance {
            // biome-ignore lint/complexity/noThisInStatic: `this` is the subclass `of` was called on
            return new this(constructorToken, model);
        }

        of(
            update: (
                current: StandardSchemaV1.InferOutput<ModelSchema>
            ) => StandardSchemaV1.InferInput<ModelSchema>
        ): this {
            const Constructor = this.constructor as typeof DomainType;

            return Constructor.of.call(
                Constructor,
                update(this[modelSymbol])
            ) as this;
        }

        with(changes: Partial<StandardSchemaV1.InferInput<ModelSchema>>): this {
            return this.of(
                (current) =>
                    ({
                        ...(current as object),
                        ...changes
                    }) as StandardSchemaV1.InferInput<ModelSchema>
            );
        }

        constructor(
            privateConstructor: typeof constructorToken,
            model: StandardSchemaV1.InferInput<ModelSchema>
        ) {
            if (privateConstructor !== constructorToken) {
                throw new DirectConstructionError({
                    className: new.target.name
                });
            }

            const schema = (this.constructor as typeof DomainType).schema;

            const parsedModelData = parseSync(schema, model);

            Object.defineProperty(this, modelSymbol, {
                value: parsedModelData,
                configurable: false
            });

            if (
                parsedModelData &&
                typeof parsedModelData === 'object' &&
                !Array.isArray(parsedModelData)
            ) {
                for (const [key, value] of Object.entries(parsedModelData)) {
                    Object.defineProperty(this, key, {
                        value,
                        writable: false,
                        configurable: false,
                        enumerable: true
                    });
                }
            }

            Object.defineProperty(this, classSymbol, {
                value: true,
                writable: false,
                configurable: false
            });
        }
    }

    return DomainType as unknown as DomainClass<ModelSchema>;
};

export const domainType = <ModelSchema extends StandardSchemaV1>(
    modelSchema: ModelSchema
): DomainClass<ModelSchema> => {
    return createDomainType(() => modelSchema);
};

export const recursiveDomainType = <ModelSchema extends StandardSchemaV1>(
    modelSchema: (isCurrentType: (target: unknown) => boolean) => ModelSchema
): DomainClass<ModelSchema> => {
    return createDomainType(modelSchema);
};
