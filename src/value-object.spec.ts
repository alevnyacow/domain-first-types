import { expect, test } from '@rstest/core';
import z from 'zod';
import { InvalidDataParsingError } from './errors';
import { defineValueObject } from './value-object';

class Pagination extends defineValueObject(
    z.object({
        pageSize: z.int().positive(),
        pageIndex: z.int().positive()
    })
) {
    get nextPage() {
        return new Pagination({
            ...this.model,
            pageIndex: this.model.pageIndex + 1
        });
    }

    get previousPage() {
        return new Pagination({
            ...this.model,
            pageIndex: this.model.pageIndex - 1
        });
    }
}

test('d', () => {
    const secondPage = new Pagination({
        pageIndex: 2,
        pageSize: 10
    });

    const a = null as any;
    if (a instanceof Pagination) {
        a.nextPage.model;
    }

    const firstPage = secondPage.previousPage;
    expect(firstPage.model).toStrictEqual({
        pageIndex: 1,
        pageSize: 10
    });
    try {
        const _invalidZeroPage = firstPage.previousPage;
    } catch (e: unknown) {
        if (InvalidDataParsingError.is(e)) {
            console.error('Invalid data!');
            console.error(e);
        }
    }
    expect(true).toBe(true);
});
