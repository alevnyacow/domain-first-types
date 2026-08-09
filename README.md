<p align="center">
    <picture>
        <img src='https://raw.githubusercontent.com/alevnyacow/domain-first-types/refs/heads/main/logo.svg?sanitize=true'>
    </picture>
</p>

<p align="center">
    Type-safe domain models powered by Standard Schema validation.
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/%40domain-first%2Ftypes" alt="version">
  <img src="https://img.shields.io/badge/TypeScript-ready-3178C6?logo=typescript&logoColor=white?style=for-the-badge" alt="size">
  <img src="https://img.shields.io/npm/l/%40domain-first%2Ftypes" alt="license">
</p>

# Installation

```
npm i @domain-first/types
```

# Motivation

Domain models often need both runtime validation and domain-specific behavior. Keeping validation, type inference, and business logic together can lead to repetitive boilerplate.

Domain-First Types creates type-safe domain models from Standard Schema validators while leaving domain-specific behavior to your classes.

# Features

- Runtime validation through any Standard Schema compatible library
- Full TypeScript inference
- Domain behavior through class methods
- Recursive domain types

# Examples

## Quick Start

```ts
import { domainType } from "@domain-first/types";
// any schema library supporting Standard Schema can be used
import { z } from "zod";

class UserId extends domainType(z.string().nonempty()) {
    static get randomId() {
        return new UserId(globalThis.crypto.randomUUID());
    }
}

class User extends domainType(
    z.object({
        id: z.instanceof(UserId),
        name: z.string().nonempty(),
    }),
) {
    withNewName = (name: string) => {
        return new User({
            id: this.id,
            name,
        });
    };
}

const user = new User({
    id: UserId.randomId,
    name: "First User",
});

console.log(user.name); // 'First User'
// user.name = 'New Name' -> TS Error

/**
 * Domain types created from primitive schemas
 * expose their value through the `value` property.
 */
console.log(user.id.value); // 'user-1'
// user.id.value = 'new value' -> TS Error

console.log(user.withNewName("Test Name").name); // 'Test Name'
```

## Recursive types

```ts
import z from "zod";
import { recursiveDomainType } from "@domain-first/types";

class Node extends recursiveDomainType((isNode) => {
    return z.object({
        id: z.string().nonempty(),
        linkedNode: z.custom<Node>(isNode).optional(),
    });
}) {}

const node = new Node({ id: "1" });
const nodeWithLink = new Node({ id: "2", linkedNode: node });

console.log(nodeWithLink.linkedNode?.id); // 1
```

## Error handling

```ts
import { domainType, TypeParsingError } from "@domain-first/types";
import z from "zod";

class NonEmptyString extends domainType(z.string().nonempty()) {}

try {
    const _string = new NonEmptyString("");
} catch (e: unknown) {
    if (e instanceof TypeParsingError) {
        console.error(e.details.parsingIssues);
        console.error(e.details.value);
    }
}
```

# Test coverage

Will be improved in upcoming versions.

| Type       | Threshold | Current value |
| ---------- | --------- | ------------- |
| Statements | 95 %      | 96.87 %       |
| Branches   | 90 %      | 92.3 %        |
| Functions  | 100 %     | 100 %         |
| Lines      | 95 %      | 96.15 %       |
