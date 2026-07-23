<p align="center">
    <picture>
        <img src='https://raw.githubusercontent.com/alevnyacow/domain-first-types/refs/heads/main/logo.svg?sanitize=true'>
    </picture>
</p>

<p align="center">
    Type-safe Entities and Value Objects powered by Standard Schema.
</p>

<p align="center">
  <img src="https://badge.fury.io/js/@domain-first%2Ftypes.svg" alt="version">
  <img src="https://img.shields.io/bundlephobia/minzip/%40domain-first%2Ftypes" alt="size">
  <img src="https://img.shields.io/npm/l/%40domain-first%2Ftypes" alt="license">
</p>

# Installation

```
npm i @domain-first/types
```

# Motivation

Building Entities and Value Objects often involves repetitive boilerplate, such as validation, while each class still needs its own domain-specific behavior. Domain-First Types implements the shared parts while leaving domain-specific behavior to your classes.

# Quick Start

```ts
import {
    defineValueObject,
    defineEntity,
    InvalidDataParsingError,
} from "@domain-first/types";
// any schema library supporting Standard Schema can be used
import { z } from "zod";

class UserId extends defineValueObject(
    // model schema
    z.string().nonempty(),
) {}

class User extends defineEntity(
    // id schema
    z.custom<UserId>(
        // every Entity and Value Object has a static `is` method
        // for type-safe instance checks
        UserId.is,
    ),
    // model schema
    z.object({ name: z.string().nonempty() }),
) {}

const user = new User(new UserId("user-1"), { name: "First User" });

console.log(user.id.model); // "user-1", deep readonly
console.log(user.model); // { name: "First User" }, deep readonly

try {
    const invalidUserId = new UserId("");
} catch (e: unknown) {
    // use static `is` method for error checks
    if (InvalidDataParsingError.is(e)) {
        console.error(e.details.parsingIssues);
        console.error(e.details.value);
    }
}
```
