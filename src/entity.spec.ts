import { expect, test } from '@rstest/core';
import { type } from 'arktype';
import { defineEntity } from './entity';

class User extends defineEntity(type('string'), type({ name: 'string' })) {}

test('hello', () => {
    const a = new User('2', { name: 'string' });
    console.log(a.id);
    console.log(a.model);
    expect(true).toBe(true);
});
