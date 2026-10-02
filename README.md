<p align="center">
    <picture>
        <img src='https://raw.githubusercontent.com/alevnyacow/domain-first-types/refs/heads/main/logo.svg?sanitize=true'>
    </picture>
</p>

<p align="center">
    <b>Turn your Zod / Valibot / any Standard Schema into real domain classes.</b><br>
    Validated on creation. Immutable. Fully typed. With your business logic inside.
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/%40domain-first%2Ftypes" alt="version">
  <img src='https://img.shields.io/badge/test%20coverage-100%25-brightgreen'>
  <img src="https://img.shields.io/badge/TypeScript-ready-3178C6?logo=typescript&logoColor=white?style=for-the-badge" alt="size">
  <img src="https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release" alt="semver">
  <img src="https://img.shields.io/npm/l/%40domain-first%2Ftypes" alt="license">
</p>

```ts
class Email extends domainType(z.email()) {
    get domain() {
        return this.value.split("@")[1];
    }
}

const email = new Email("john@example.com");
email.value;  // "john@example.com"
email.domain; // "example.com"

new Email("not-an-email"); // throws TypeParsingError
```

One line turns a schema into a class. If you have an `Email`, it is valid. You don't need to check it again.

# Installation

```
npm i @domain-first/types
```

Use the schema library you already have. Anything that implements [Standard Schema](https://standardschema.dev) works, including **Zod**, **Valibot**, **ArkType**, **Joi** and more.

# Why?

This is how domain data usually looks in a TypeScript codebase:

```ts
type Order = {
    id: string;
    customerEmail: string;
    total: number;
    status: string;
};

function pay(order: Order) {
    if (order.status !== "draft") throw new Error("...");
    // anyone can mutate anything, anywhere
    order.status = "paid";
}
```

- **Everything is a `string`.** Nothing stops you from passing an unchecked user input where a checked email is expected.
- **Validation is optional.** The schema exists, but whether it ran depends on the code path, so every layer re-checks "just in case".
- **Logic is scattered.** Rules about orders live in services, helpers and utils instead of on the order itself.
- **Hand-written classes are boilerplate.** Private constructors, `static create()`, readonly fields, and a TypeScript type that duplicates the schema.

With Domain-First Types, **the schema is the class**:

```ts
import { domainType } from "@domain-first/types";
import { z } from "zod";

class Money extends domainType(
    z.object({
        amount: z.number().int().nonnegative(),
        currency: z.enum(["USD", "EUR"]),
    }),
) {
    add(other: Money) {
        if (other.currency !== this.currency) {
            throw new Error("Currency mismatch");
        }
        return new Money({
            ...this.snapshot(),
            amount: this.amount + other.amount,
        });
    }
}

class Order extends domainType(
    z.object({
        id: z.uuid(),
        // value objects compose naturally
        customer: z.instanceof(Email),
        total: z.instanceof(Money),
        status: z.enum(["draft", "paid", "shipped"]),
    }),
) {
    pay() {
        if (this.status !== "draft") {
            throw new Error(`Order is already ${this.status}`);
        }
        return new Order({
            ...this.snapshot(),
            status: "paid",
        });
    }
}

const order = new Order({
    id: crypto.randomUUID(),
    customer: new Email("john@example.com"),
    total: new Money({ amount: 4200, currency: "USD" }),
    status: "draft",
});

const paid = order.pay();

order.status;         // "draft": original is untouched
paid.status;          // "paid"
paid.customer.domain; // "example.com"

// ❌ TS error, and a TypeError at runtime
order.status = "shipped";
```

What you get from this:

| | |
|---|---|
| ✅ **Always valid** | The constructor runs the schema. You can't create an invalid instance. |
| 🔒 **Immutable** | Fields are deeply `readonly` in TypeScript and non-writable at runtime. |
| 🧠 **Full inference** | Constructor arguments and fields come from the schema. You don't write types twice. |
| 🧩 **Behavior lives with data** | It's a regular class, so you can add methods, getters and static factories. |
| 🔌 **No lock-in** | Works with any Standard Schema library, and you can mix them. |
| 🪶 **Tiny** | A thin layer over your schema library. |

# Guide

## Value objects from primitives

When the schema describes a primitive, the result is exposed as `.value`:

```ts
class UserId extends domainType(z.uuid()) {
    static generate() {
        return new UserId(crypto.randomUUID());
    }
}

class Age extends domainType(z.number().int().min(0)) {
    get isAdult() {
        return this.value >= 18;
    }
}

UserId.generate().value; // "3f1c…"
new Age(21).isAdult;     // true
new Age(-1);             // throws TypeParsingError
```

Functions can now ask for exactly what they need:

```ts
function sendWelcome(to: Email) {
    // no need to validate `to` here
}

// ❌ TS error: string is not an Email
sendWelcome("john@example.com");
// ✅
sendWelcome(new Email("john@example.com"));
```

## Entities and immutable updates

When the schema describes an object, every field becomes a readonly property on the instance. `snapshot()` returns the underlying data, so you can build an updated copy:

```ts
class User extends domainType(
    z.object({
        id: z.instanceof(UserId),
        name: z.string().nonempty(),
        email: z.instanceof(Email),
    }),
) {
    rename(name: string) {
        // validated again
        return new User({ ...this.snapshot(), name });
    }
}

const user = new User({
    id: UserId.generate(),
    name: "John",
    email: new Email("john@example.com"),
});

user.rename("Jane").name; // "Jane"
// throws: business rules hold for every copy
user.rename("");
```

## Parse once, at the boundary

Create domain objects where untrusted data comes in, such as an HTTP handler, a queue consumer or a DB mapper. Everything after that point works with valid objects:

```ts
import { TypeParsingError } from "@domain-first/types";

app.post("/users", (req, res) => {
    try {
        const user = new User({
            id: UserId.generate(),
            name: req.body.name,
            email: new Email(req.body.email),
        });

        // no more defensive checks downstream
        userService.register(user);
        res.status(201).end();
    } catch (e) {
        if (e instanceof TypeParsingError) {
            // standard schema issues + the original value
            return res
                .status(400)
                .json({ issues: e.details.parsingIssues });
        }
        throw e;
    }
});
```

## Bring any schema library

```ts
import * as v from "valibot";

class Age extends domainType(
    v.pipe(v.number(), v.integer(), v.minValue(0)),
) {
    get isAdult() {
        return this.value >= 18;
    }
}
```

Zod, Valibot, ArkType, Joi and the rest all work the same way. You can even mix them inside one model.

## Recursive types

Use `recursiveDomainType` for trees, linked lists and anything else that refers to its own type:

```ts
import { recursiveDomainType } from "@domain-first/types";

class Category extends recursiveDomainType((isCategory) =>
    z.object({
        name: z.string().nonempty(),
        parent: z.custom<Category>(isCategory).optional(),
    }),
) {
    get path(): string {
        return this.parent
            ? `${this.parent.path} / ${this.name}`
            : this.name;
    }
}

const keyboards = new Category({
    name: "Keyboards",
    parent: new Category({ name: "Electronics" }),
});

keyboards.path; // "Electronics / Keyboards"
```

## Reusing the schema

Every domain class exposes the schema it was built from, so you can reuse it for forms, OpenAPI generation or anything else:

```ts
User.schema; // the original Zod schema
```

# API

| Export | Description |
|---|---|
| `domainType(schema)` | Returns a base class to `extend`. Its constructor validates input with `schema`. |
| `recursiveDomainType((isSelf) => schema)` | The same, for self-referencing types. `isSelf` is a type guard for instances of the class being defined. |
| `instance.value` | The parsed value, for primitive schemas. |
| `instance.<field>` | Readonly fields, for object schemas. |
| `instance.snapshot()` | The parsed data, for object schemas. Useful for creating updated copies. |
| `Class.schema` | The original schema. |
| `TypeParsingError` | Thrown on invalid input. `e.details.parsingIssues` and `e.details.value` hold the issues and the rejected input. |
| `AsyncSchemaInSyncParsingError` | Thrown if the schema needs async validation, since constructors are synchronous. |
| `DeepReadonly<T>` | The helper type used for instance fields. |

# Good to know

- **Validation is synchronous.** Constructors can't be `async`, so schemas with async refinements throw `AsyncSchemaInSyncParsingError`.
- **Transforms are supported.** The constructor accepts the schema's input type, and the instance holds the output type. For example, with `z.string().trim()` the instance stores the trimmed string.
- **Runtime immutability is shallow.** Top-level fields can't be reassigned at runtime. Nested plain objects are `readonly` only at the type level. To make nested parts immutable at runtime, model them as domain types too.

# License

MIT
