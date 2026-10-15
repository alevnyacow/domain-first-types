# API Reference

Technical specification of the public API of `@domain-first/types`.

- [Package](#package)
- [Exports overview](#exports-overview)
- [Functions](#functions)
    - [`domainType`](#domaintype)
    - [`recursiveDomainType`](#recursivedomaintype)
- [Domain class](#domain-class)
    - [`Class.of()`](#classof)
    - [Constructor](#constructor)
    - [`Class.schema`](#classschema)
    - [`instance.<field>`](#instancefield)
    - [`instance.snapshot`](#instancesnapshot)
    - [`instance.of()`](#instanceof)
    - [`instance.with()`](#instancewith)
- [Errors](#errors)
    - [`TypeParsingError`](#typeparsingerror)
    - [`AsyncSchemaInSyncParsingError`](#asyncschemainsyncparsingerror)
    - [`DirectConstructionError`](#directconstructionerror)
    - [Common error members](#common-error-members)
- [Types](#types)
    - [`DeepReadonly<T>`](#deepreadonlyt)
- [Runtime semantics](#runtime-semantics)
    - [Field extraction](#field-extraction)

Notation used below:

- `S` is a schema type that extends `StandardSchemaV1` from [`@standard-schema/spec`](https://standardschema.dev).
- `Input<S>` is `StandardSchemaV1.InferInput<S>`, the type the schema accepts.
- `Output<S>` is `StandardSchemaV1.InferOutput<S>`, the type the schema produces.
- An **object output** is an `Output<S>` that extends `object` and is not an array. Any other output (string, number, `null`, arrays, …) is a **value output**.

## Package

| Property     | Value                                                        |
| ------------ | ------------------------------------------------------------ |
| Name         | `@domain-first/types`                                        |
| Entry point  | `.` (single entry, no subpath exports)                       |
| Formats      | ESM (`dist/index.js`), CommonJS (`dist/index.cjs`)           |
| Types        | `dist/index.d.ts`                                            |
| Dependencies | `@standard-schema/spec`, `@domain-first/errors`              |
| Schema libs  | Any Standard Schema v1 implementation (Zod, Valibot, ArkType, Joi, …). None are bundled. |

## Exports overview

| Export                          | Kind     | Section                                                         |
| ------------------------------- | -------- | --------------------------------------------------------------- |
| `domainType`                    | function | [`domainType`](#domaintype)                                     |
| `recursiveDomainType`           | function | [`recursiveDomainType`](#recursivedomaintype)                   |
| `TypeParsingError`              | class    | [`TypeParsingError`](#typeparsingerror)                         |
| `AsyncSchemaInSyncParsingError` | class    | [`AsyncSchemaInSyncParsingError`](#asyncschemainsyncparsingerror) |
| `DirectConstructionError`       | class    | [`DirectConstructionError`](#directconstructionerror)           |
| `DeepReadonly`                  | type     | [`DeepReadonly<T>`](#deepreadonlyt)                             |

Nothing else is part of the public API.

## Functions

### `domainType`

Creates a base class for a domain type from a schema.

**Signature**

```ts
function domainType<S extends StandardSchemaV1>(modelSchema: S): DomainClass<S>;
```

**Parameters**

| Name          | Type | Description                                                  |
| ------------- | ---- | ------------------------------------------------------------ |
| `modelSchema` | `S`  | Any Standard Schema. It validates every instance creation.   |

**Returns**

`DomainClass<S>`: a class meant to be `extend`ed. See [Domain class](#domain-class).

**Behavior**

- Every call creates a new, independent class. Two calls with the same schema produce unrelated classes.
- The schema is stored as-is on the class as `schema`. It is not copied or wrapped.
- The returned class is meant to be extended: `class X extends domainType(...) {}`. An empty subclass body is fine.

**Throws**

Nothing at creation time. Validation happens in [`Class.of()`](#classof).

**Example**

```ts
class Email extends domainType(z.email()) {}
class Money extends domainType(z.object({ amount: z.number(), currency: z.string() })) {}
```

### `recursiveDomainType`

Creates a base class for a domain type whose schema refers to the type itself.

**Signature**

```ts
function recursiveDomainType<S extends StandardSchemaV1>(
    modelSchema: (isCurrentType: (target: unknown) => boolean) => S
): DomainClass<S>;
```

**Parameters**

| Name          | Type                                              | Description                                                                 |
| ------------- | ------------------------------------------------- | --------------------------------------------------------------------------- |
| `modelSchema` | `(isCurrentType: (target: unknown) => boolean) => S` | Factory that receives a guard and returns the schema. Called once, when the class is created. |

The `isCurrentType` guard:

| Input                                                         | Result  |
| ------------------------------------------------------------- | ------- |
| An instance of the class being defined (or of its subclasses) | `true`  |
| Any other value, including instances of other domain types    | `false` |

The guard checks for a hidden per-class symbol on the target, not the prototype chain.

**Returns**

`DomainClass<S>`, same as [`domainType`](#domaintype).

**Behavior**

Same as [`domainType`](#domaintype). `domainType(schema)` is equivalent to `recursiveDomainType(() => schema)`.

**Throws**

Whatever the factory throws, at class creation time.

**Example**

```ts
class Category extends recursiveDomainType((isCategory) =>
    z.object({
        name: z.string(),
        parent: z.custom<Category>(isCategory).optional(),
    }),
) {}
```

## Domain class

`DomainClass<S>` is the class returned by [`domainType`](#domaintype) and [`recursiveDomainType`](#recursivedomaintype). It is not exported as a named type. Its shape:

```ts
type DomainClass<S extends StandardSchemaV1> = {
    /** @deprecated Use `Class.of()` instead: the constructor is private. */
    new (privateConstructor: PrivateToken, model: Input<S>): DomainInstance<S>;
    schema: S;
    of<Class extends abstract new (...args: any) => any>(
        this: Class,
        model: Input<S>
    ): InstanceType<Class>;
};

type DomainInstance<S> = {
    readonly snapshot: Output<S>;
    of<Instance>(
        this: Instance,
        update: (current: Output<S>) => Input<S>
    ): Instance;
} & (HasFields<Output<S>> extends true
    ? DeepReadonly<DataFields<Output<S>>> & {
          with<Instance>(this: Instance, changes: Partial<Input<S>>): Instance;
      }
    : {});

// `any` or a non-array object.
type HasFields<T> = 0 extends 1 & T
    ? true
    : [T] extends [readonly unknown[]]
      ? false
      : [T] extends [object]
        ? true
        : false;

// Every key of T except methods.
type DataFields<T> = {
    [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K];
};
```

| Member                                     | Object output | Value output     |
| ------------------------------------------ | :-----------: | :--------------: |
| [`Class.of()`](#classof)                   | ✅            | ✅               |
| [`Class.schema`](#classschema)             | ✅            | ✅               |
| [`instance.snapshot`](#instancesnapshot)   | ✅            | ✅               |
| [`instance.of()`](#instanceof)             | ✅            | ✅               |
| [`instance.<field>`](#instancefield)       | ✅            | —                |
| [`instance.with()`](#instancewith)         | ✅            | — (runtime only) |

"Runtime only" means the method exists on the prototype but is not part of the TypeScript type. Do not rely on it.

### `Class.of()`

Creates a validated instance. This is the only public way to create one.

**Signature**

```ts
static of<Class extends abstract new (...args: any) => any>(
    this: Class,
    model: Input<S>
): InstanceType<Class>;
```

**Parameters**

| Name    | Type       | Description                         |
| ------- | ---------- | ----------------------------------- |
| `model` | `Input<S>` | Raw data to validate with `schema`. |

**Returns**

A new instance of the class `of` was called on (`Email.of(...)` returns an `Email`, `Admin.of(...)` returns an `Admin`).

**Behavior**

1. Calls the [constructor](#constructor) of `this` with the private token and `model`.
2. The constructor reads `schema` from the actual class (`this.constructor.schema`).
3. Runs `schema['~standard'].validate(model)` synchronously.
4. Stores the parsed `Output<S>` in a non-enumerable property keyed by a private symbol (read by `snapshot`, `of()` and `with()`). It is not reachable through string keys.
5. If the output is a non-null object and not an array, defines one own property per `Object.entries(output)` entry. See [Field extraction](#field-extraction).
6. Marks the instance with a hidden per-class symbol (used by `isCurrentType`).

Own field properties are defined with:

| Attribute      | Value   |
| -------------- | ------- |
| `writable`     | `false` |
| `configurable` | `false` |
| `enumerable`   | `true`  |

**Throws**

| Error                                                             | When                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------- |
| [`AsyncSchemaInSyncParsingError`](#asyncschemainsyncparsingerror) | `validate` returns a `Promise`.                         |
| [`TypeParsingError`](#typeparsingerror)                           | `validate` returns a result with non-empty `issues`.    |

**Example**

```ts
const email = Email.of("john@example.com");
Email.of("nope"); // throws TypeParsingError
```

### Constructor

The constructor is private. Use [`Class.of()`](#classof) instead.

**Signature**

```ts
new (privateConstructor: PrivateToken, model: Input<S>)
```

`PrivateToken` is a `unique symbol` that the package does not export.

**Behavior**

- The construct signature cannot be removed from the type: `class X extends ...` requires one. Instead, it is marked `@deprecated`, so editors show `new X(...)` struck through with the hint *"Use `Class.of()` instead: the constructor is private."*
- `new X(...)` is a TypeScript error both outside the class and inside subclasses, since the token cannot be obtained.
- At runtime, a call without the token throws [`DirectConstructionError`](#directconstructionerror) before any validation.
- Subclasses must not declare their own constructor: they cannot call `super` with the token. Use static factory methods built on `of()` instead.

TypeScript cannot express a `protected` constructor here: the instance type is computed from the schema, and construct signatures in type literals do not accept access modifiers.

**Throws**

| Error                                                 | When                         |
| ----------------------------------------------------- | ---------------------------- |
| [`DirectConstructionError`](#directconstructionerror) | Called without the token.    |

**Example**

```ts
new Email("john@example.com"); // TS error; throws DirectConstructionError at runtime
```

### `Class.schema`

**Signature**

```ts
static readonly schema: S;
```

**Behavior**

- The exact schema object passed to `domainType` (or returned by the `recursiveDomainType` factory).
- Inherited by subclasses. The constructor validates against `this.constructor.schema`, so a subclass that redefines `static schema` validates with its own schema.

**Example**

```ts
Email.schema; // the original z.email() schema
```

### `instance.snapshot`

Available for every schema.

**Signature**

```ts
get snapshot(): Output<S>;
```

**Returns**

The parsed output, typed as `Output<S>` (not `readonly`).

**Behavior**

- A getter on the prototype, not an own property: it is not enumerable and is not included in `Object.keys`, spread or `JSON.stringify`.
- Returns the stored parsed value itself, not a copy. For object outputs, mutating it mutates the data `snapshot` and `with()` see later, but not the instance's own field properties.
- The only way to read value outputs (primitives, arrays), and the only way to reach methods and getters of non-plain object outputs (`Date`, `Map`, class instances).
- Nested domain instances are returned as-is.

**Throws**

Nothing.

**Example**

```ts
Email.of("john@example.com").snapshot; // "john@example.com"
CreatedAt.of(new Date(0)).snapshot.getTime(); // 0
money.snapshot; // { amount: 10, currency: "USD" }
```

### `instance.<field>`

Available for object outputs.

**Type**

```ts
DeepReadonly<DataFields<Output<S>>>
```

**Behavior**

- One own enumerable property per `Object.entries(output)` entry. See [Field extraction](#field-extraction).
- Values are the parsed values (after transforms and defaults), not the raw input.
- Assignment fails: a TypeScript error at compile time, and a `TypeError` at runtime in strict mode (silently ignored in sloppy mode).
- Nested values are deeply `readonly` only at the type level. At runtime, nested plain objects and arrays stay mutable.

**Example**

```ts
const money = Money.of({ amount: 10, currency: "USD" });
money.amount; // 10
money.amount = 20; // TS error; TypeError at runtime
```

### `instance.of()`

Available for every schema.

**Signature**

```ts
of<Instance>(
    this: Instance,
    update: (current: Output<S>) => Input<S>
): Instance;
```

**Parameters**

| Name     | Type                                | Description                                                    |
| -------- | ----------------------------------- | -------------------------------------------------------------- |
| `update` | `(current: Output<S>) => Input<S>`  | Receives the current `snapshot` and returns the new model.     |

To replace the value without looking at the current one, use [`Class.of()`](#classof).

**Returns**

A new instance of the same runtime class as `this` (subclasses included), typed as the type of `this`.

**Behavior**

1. Calls `update` with the stored output.
2. Passes the result to `this.constructor.of()`.
3. The original instance is not changed.

Consequences:

- The new model goes through full validation.
- The updater receives the stored output by reference. Return a new value instead of mutating `current`.

**Throws**

Whatever `update` throws, and the same errors as [`Class.of()`](#classof).

**Example**

```ts
class Counter extends domainType(z.number().int().nonnegative()) {
    get incremented() {
        return this.of((x) => x + 1);
    }
}

Counter.of(1).incremented.snapshot; // 2

class Names extends domainType(z.array(z.string())) {}
Names.of(["a"]).of((names) => [...names, "b"]).snapshot; // ["a", "b"]
```

### `instance.with()`

Available for object outputs.

**Signature**

```ts
with<Instance>(this: Instance, changes: Partial<Input<S>>): Instance;
```

**Parameters**

| Name      | Type                | Description                         |
| --------- | ------------------- | ----------------------------------- |
| `changes` | `Partial<Input<S>>` | Fields to override. Shallow merge.  |

**Returns**

A new instance of the same runtime class as `this` (subclasses included), typed as the type of `this`.

**Behavior**

1. Builds `{ ...storedOutput, ...changes }` (shallow merge of own enumerable properties).
2. Passes the result to [`instance.of()`](#instanceof).
3. The original instance is not changed.

Consequences:

- The merged object goes through full validation again.
- Untouched fields are passed as their **parsed output**. If the schema has transforms whose output is not valid input, `with()` can fail or transform twice.
- The merged object is always a plain object. For non-plain outputs (`Date`, `Map`, class instances) the prototype is lost, so validation usually fails. `with()` is meant for plain object schemas.

**Throws**

Same as [`Class.of()`](#classof).

**Example**

```ts
const more = money.with({ amount: 20 });
more.amount; // 20
money.amount; // 10
```

## Errors

All errors are created with [`@domain-first/errors`](https://www.npmjs.com/package/@domain-first/errors) under the namespace `@DOMAIN-FIRST/TYPES`.

### `TypeParsingError`

Thrown when the schema reports validation issues.

| Property  | Value                                                                    |
| --------- | ------------------------------------------------------------------------ |
| `code`    | `"@DOMAIN-FIRST/TYPES.INVALID_DATA"`                                     |
| `name`    | `"@DOMAIN-FIRST/TYPES.INVALID_DATA"`                                     |
| `details` | `{ parsingIssues: readonly StandardSchemaV1.Issue[]; value: unknown }`   |

| `details` field | Description                                    |
| --------------- | ---------------------------------------------- |
| `parsingIssues` | Issues returned by the schema, unchanged.      |
| `value`         | The rejected input passed to `Class.of()`.     |

**Example**

```ts
try {
    Email.of("nope");
} catch (e) {
    if (e instanceof TypeParsingError) {
        e.details.parsingIssues; // readonly StandardSchemaV1.Issue[]
        e.details.value; // "nope"
    }
}
```

### `AsyncSchemaInSyncParsingError`

Thrown when the schema validates asynchronously (its `validate` returns a `Promise`). Instance creation is synchronous, so async schemas are not supported.

| Property  | Value                                    |
| --------- | ---------------------------------------- |
| `code`    | `"@DOMAIN-FIRST/TYPES.ASYNC_LOGIC"`      |
| `name`    | `"@DOMAIN-FIRST/TYPES.ASYNC_LOGIC"`      |
| `details` | `Record<string, unknown>`                |

At runtime `details` is `{ schema, value }`: the schema that returned a promise and the input passed to `Class.of()`.

### `DirectConstructionError`

Thrown when a domain class constructor is called directly (without the private token), for example from plain JavaScript.

| Property  | Value                                         |
| --------- | --------------------------------------------- |
| `code`    | `"@DOMAIN-FIRST/TYPES.DIRECT_CONSTRUCTION"`   |
| `name`    | `"@DOMAIN-FIRST/TYPES.DIRECT_CONSTRUCTION"`   |
| `details` | `{ className: string }`                       |

| `details` field | Description                                    |
| --------------- | ---------------------------------------------- |
| `className`     | `name` of the class `new` was called on.       |

### Common error members

All error classes extend `Error` and share the members provided by `@domain-first/errors`:

| Member                                     | Kind            | Description                                                                 |
| ------------------------------------------ | --------------- | --------------------------------------------------------------------------- |
| `new (details, options?: ErrorOptions)`    | constructor     | `options.cause` is forwarded to `Error`.                                    |
| `code`                                     | `string`        | Namespaced error code (see tables above).                                   |
| `name`                                     | `string`        | Same as `code`.                                                             |
| `message`                                  | `string`        | `JSON.stringify(formattedDetails)`.                                         |
| `details`                                  | `Details`       | Typed payload (see tables above).                                           |
| `metadata`                                 | `{}`            | Always an empty object for these errors.                                    |
| `formattedDetails`                         | getter          | `details` flattened into a `Record<string, string \| number \| boolean>` with dot-separated keys. |
| `serialized`                               | getter          | `{ code, metadata }`.                                                       |
| `serializedWithNativeData`                 | getter          | `{ code, metadata, name, message }`.                                        |
| `serializedFull`                           | getter          | `{ code, metadata, name, message, details }`.                               |
| `Class.is(target: unknown)`                | static, guard   | `true` if `target` was created by this exact error class (in this realm).   |
| `Class.matches(target: unknown)`           | static          | `true` if `target` has the same `code` and `metadata`. Works for deserialized errors. |

`instanceof` also works within one copy of the package.

## Types

### `DeepReadonly<T>`

The helper type used for instance fields.

**Definition**

```ts
type DeepReadonly<T> = T extends (...args: any[]) => any
    ? T
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;
```

**Behavior**

| `T`                    | Result                                                  |
| ---------------------- | ------------------------------------------------------- |
| Function               | `T` unchanged                                           |
| Object (incl. arrays)  | Every key `readonly`, applied recursively               |
| Primitive              | `T` unchanged                                           |

Type-level only; it has no runtime effect.

## Runtime semantics

| Topic                    | Behavior                                                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Validation timing        | Synchronous, on every `Class.of()` call (including `instance.of()` and `with()`).                                                                              |
| Input vs output          | `Class.of()` accepts `Input<S>`. Fields and `snapshot` expose `Output<S>` (transforms and defaults applied).                           |
| Immutability             | Own fields are non-writable and non-configurable. The instance is not frozen: new properties can still be added. Nested data is mutable at runtime. |
| Equality                 | No built-in equality. Instances are compared by reference.                                                                                |
| Enumeration / JSON       | Only fields are enumerable, so `Object.keys`, spread and `JSON.stringify` see only the data. Instances with value outputs have no enumerable keys (`JSON.stringify` gives `{}`). |
| Composition              | Nest domain types by validating with the schema library's instance check (`z.instanceof(X)`, `v.instance(X)`, `Joi.object().instance(X)`). |
| Mixing libraries         | Allowed. Each class uses its own schema.                                                                                                  |
| Class identity           | Each `domainType` / `recursiveDomainType` call creates a distinct class with its own hidden marker symbol.                                |
| Reserved names           | A field named `snapshot`, `of` or `with` becomes an own property and shadows the member.                                                  |
| Subclasses               | `Class.of()`, `instance.of()` and `with()` preserve the runtime class and the static type. Subclasses cannot declare constructors. |

### Field extraction

Fields are extracted the same way for every object output. Arrays are excluded on both levels:

| Level   | Rule                                                                                                   |
| ------- | ------------------------------------------------------------------------------------------------------ |
| Runtime | Own enumerable string-keyed properties: `Object.entries(output)`. Skipped when `Array.isArray(output)`. |
| Types   | Every key of `Output<S>` whose value is not a function (`DataFields<Output<S>>`). None for arrays.       |

How this plays out for common outputs:

| Output                               | Runtime fields              | Type-level fields                 | Use `snapshot` for          |
| ------------------------------------ | --------------------------- | --------------------------------- | --------------------------- |
| Plain object (`z.object`)            | All keys                    | All non-function keys             | —                           |
| Class instance (`z.instanceof(X)`)   | Own enumerable properties   | Non-method members, incl. getters | Methods, getters            |
| `Date`                               | None                        | None                              | Everything                  |
| `Map`, `Set`                         | None                        | `size`                            | Everything                  |
| Array                                | None                        | None                              | Everything                  |
| Primitive                            | None                        | None                              | The value                   |

Known mismatches between types and runtime, all caused by TypeScript not distinguishing own properties from prototype members:

- Getters (class getters, `Map#size`) are typed as fields but are not own enumerable properties, so they read as `undefined`. Use `snapshot`.
- Function-valued fields of plain objects (`z.object({ fn: z.function() })`) exist at runtime but are excluded from the type. Use `snapshot`.
