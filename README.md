<p align="center">
    <picture>
        <img src='https://raw.githubusercontent.com/alevnyacow/domain-first-types/refs/heads/main/logo.svg?sanitize=true'>
    </picture>
</p>

<p align="center">
    Type-safe Entities and Value Objects with Standard Schema validation.
</p>

# Installation

```
npm i @domain-first/types
```

# Quick Start

```ts
import { defineValueObject, defineEntity } from "@domain-first/types";
// any schema library supporting Standard Schema can be used
import { z } from "zod";

// User Id (Value Object)
class UserId extends defineValueObject(
    // model schema
    z.string().nonempty(),
) {}

// User (Entity)
class User extends defineEntity(
    // id schema
    z.custom<UserId>(UserId.is),
    // model schema
    z.object({ name: z.string().nonempty() }),
) {}

const user = new User(
    // identifier
    new UserId("user-1"),
    // model
    { name: "First User" },
);
```
