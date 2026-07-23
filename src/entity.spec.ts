import { expect, test } from '@rstest/core';
import z from 'zod';
import { defineEntity } from './entity';

class User extends defineEntity(z.string(), z.object({ name: z.string() })) {}

test('hello', () => {
    const a = new User('dd', { name: 'd' });
    console.log(a.id);
    console.log(a.model);
    expect(true).toBe(true);
});
