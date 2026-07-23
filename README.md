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

## Value Object

```ts
import { defineValueObjectClass } from "@domain-first/types";
import { z } from "zod";

/**
 * Create a value object by extending `defineValueObjectClass`.
 * The constructor validates input using your schema and exposes
 * validated data through `model`, exposed as a deeply readonly type.
 */
class Pagination extends defineValueObjectClass(
    z.object({
        pageSize: z.int().positive(),
        pageIndex: z.int().positive(),
    }),
) {
    get nextPage(): Pagination {
        return new Pagination({
            ...this.model,
            pageIndex: this.model.pageIndex + 1,
        });
    }
}

const secondPage = new Pagination({
    pageSize: 10,
    pageIndex: 2,
});

secondPage.model.pageIndex;
// 2

const thirdPage = secondPage.nextPage;

thirdPage.model;
// { pageSize: 10, pageIndex: 3 }
```
