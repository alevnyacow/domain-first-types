import { expect, test } from '@rstest/core';
import * as v from 'valibot';
import z from 'zod';
import { parseSync } from './parse-sync';

test('Zod with valid data', () => {
    const parsedObject = parseSync(z.object({ hello: z.string().nonempty() }), {
        hello: 'world'
    });

    expect(parsedObject).toEqual({ hello: 'world' });
});

test('Valibot with valid data', () => {
    const parsedObject = parseSync(
        v.object({ hello: v.pipe(v.string(), v.nonEmpty()) }),
        { hello: 'world' }
    );

    expect(parsedObject).toEqual({ hello: 'world' });
});
