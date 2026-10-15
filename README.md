# Domain First Types

<p>
    <img src="https://img.shields.io/npm/v/%40domain-first%2Ftypes" alt="version">
    <img src='https://img.shields.io/badge/test%20coverage-100%25-brightgreen'>
    <img src="https://img.shields.io/badge/TypeScript-ready-3178C6?logo=typescript&logoColor=white?style=for-the-badge" alt="size">
    <img src="https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release" alt="semver">
    <img src="https://img.shields.io/npm/l/%40domain-first%2Ftypes" alt="license">
</p>

Turn your Zod / Valibot / any Standard Schema into real domain classes.

## What is it?

In most TypeScript codebases domain data is a bag of `string`s and `number`s. Validation is optional, anyone can mutate anything, and the rules about an order live in services and helpers instead of on the order itself.

Domain First Types makes **the schema the class**. One line turns a schema into a base class: every instance is validated on creation, its fields are readonly, its types are inferred from the schema, and you add behavior as regular methods. If you have an `Email`, it is valid. You don't need to check it again.

It works with any [Standard Schema](https://standardschema.dev) library: Zod, Valibot, ArkType, Joi and more.

```
npm i @domain-first/types
```

## API

The full technical specification lives in [API.md](./API.md).

## Guide

### How to declare

Extend `domainType` with any schema. Add methods and getters as in a regular class.

```ts
import { domainType } from "@domain-first/types";
import { z } from "zod";

class Email extends domainType(z.email()) {
    get domain() {
        return this.snapshot.split("@")[1];
    }
}

class User extends domainType(
    z.object({
        name: z.string().nonempty(),
        email: z.instanceof(Email),
    }),
) {}
```

### How to create

Use the static `of`. It validates the input and throws on invalid data. `new` is not available.

```ts
const email = Email.of("john@example.com");
const user = User.of({ name: "John", email });

Email.of("not-an-email"); // throws TypeParsingError
```

### How to read

Fields of object schemas are readonly properties. `snapshot` holds the parsed data of any domain type.

```ts
user.name; // "John"
user.email.domain; // "example.com"

email.snapshot; // "john@example.com"
user.snapshot; // { name: "John", email: Email }

user.name = "Jane"; // TS error, and a TypeError at runtime
```

### How to update

Instances are immutable: updates return a new validated instance of the same class.

```ts
class Counter extends domainType(z.number().int().nonnegative()) {
    get incremented() {
        // `of` takes an updater for any domain type
        return this.of((current) => current + 1);
    }
}

Counter.of(1).incremented.snapshot; // 2

// `with` merges changes into object schemas
user.with({ name: "Jane" }).name; // "Jane"
user.name; // "John": original is untouched
```

### How to add factories

Build static factories on top of `of`.

```ts
class UserId extends domainType(z.uuid()) {
    static generate() {
        return UserId.of(crypto.randomUUID());
    }
}
```

### How to reference the type itself

Use `recursiveDomainType` for trees and other self-referencing models.

```ts
import { recursiveDomainType } from "@domain-first/types";

class Category extends recursiveDomainType((isCategory) =>
    z.object({
        name: z.string(),
        parent: z.custom<Category>(isCategory).optional(),
    }),
) {}

Category.of({ name: "Keyboards", parent: Category.of({ name: "Electronics" }) });
```

### How to handle invalid data

Parse untrusted input once, at the boundary.

```ts
import { TypeParsingError } from "@domain-first/types";

try {
    Email.of(input);
} catch (e) {
    if (e instanceof TypeParsingError) {
        e.details.parsingIssues; // Standard Schema issues
        e.details.value; // the rejected input
    }
}
```

## License

MIT
