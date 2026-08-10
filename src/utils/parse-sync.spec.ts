import { expect, test } from '@rstest/core';
import * as v from 'valibot';
import z from 'zod';
import { parseSync } from './parse-sync';
import { AsyncSchemaInSyncParsingError } from '../errors';

test('async schema', () => {
    const asyncSchema = z.string().refine(async (x) => { return true })

    expect(() => parseSync(asyncSchema, '33')).toThrow(AsyncSchemaInSyncParsingError)
})

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
