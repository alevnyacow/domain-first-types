import { expect, test } from '@rstest/core';
import z from 'zod';
import { defineValueObjectClass } from './value-object';

const Money = defineValueObjectClass(
    z.object({
        currency: z.string()
    })
);

// class Money2 extends defineValueObjectClass(
//     z.object({
//         currency: z.string()
//     })
// ) {}

const he = Money.create({ currency: '22' });

test('d', () => {
    he.model.currency = '22222';
    console.log(he.model);
    expect(true).toBe(true);
});
