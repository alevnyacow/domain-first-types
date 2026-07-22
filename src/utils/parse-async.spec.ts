import { expect, test } from '@rstest/core';
import * as v from 'valibot';
import z from 'zod';
import { parseAsync } from './parse-async';

test('Zod with valid data', async () => {
    const parsedObject = await parseAsync(
        z.object({ hello: z.string().nonempty() }),
        {
            hello: 'world'
        }
    );

    expect(parsedObject).toEqual({ hello: 'world' });
});

test('Valibot with valid data', async () => {
    const parsedObject = await parseAsync(
        v.object({ hello: v.pipe(v.string(), v.nonEmpty()) }),
        { hello: 'world' }
    );

    expect(parsedObject).toEqual({ hello: 'world' });
});
