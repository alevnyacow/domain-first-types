import { expect, test } from '@rstest/core';
import Joi from 'joi';
import * as v from 'valibot';
import z from 'zod';
import { domainType, recursiveDomainType } from './domain-type';
import { TypeParsingError } from './errors';

test('zod', () => {
    class ZodNonEmptyString extends domainType(z.string().nonempty()) {}

    const nonEmptyString = new ZodNonEmptyString('non-empty');
    expect(nonEmptyString.value).toBe('non-empty');

    expect(() => new ZodNonEmptyString('')).toThrowError(
        TypeParsingError
    );

    class ZodUserData extends domainType(
        z.object({
            firstName: z.instanceof(ZodNonEmptyString),
            lastName: z.instanceof(ZodNonEmptyString),
            age: z.int().positive()
        })
    ) {}

    const userData = new ZodUserData({
        firstName: new ZodNonEmptyString('John'),
        lastName: new ZodNonEmptyString('Doe'),
        age: 30
    });

    expect(userData).toEqual({
        firstName: expect.any(ZodNonEmptyString),
        lastName: expect.any(ZodNonEmptyString),
        age: 30
    });

    expect(
        () =>
            new ZodUserData({
                firstName: new ZodNonEmptyString('John'),
                lastName: new ZodNonEmptyString('Doe'),
                age: -30
            })
    ).toThrowError(TypeParsingError);
});

test('valibot', () => {
    class ValibotNonEmptyString extends domainType(
        v.pipe(v.string(), v.nonEmpty())
    ) {}

    const nonEmptyString = new ValibotNonEmptyString('non-empty');
    expect(nonEmptyString.value).toBe('non-empty');

    expect(() => new ValibotNonEmptyString('')).toThrowError(
        TypeParsingError
    );

    class ValibotUserData extends domainType(
        v.object({
            firstName: v.instance(ValibotNonEmptyString),
            lastName: v.instance(ValibotNonEmptyString),
            age: v.pipe(v.number(), v.integer(), v.minValue(1))
        })
    ) {}

    const userData = new ValibotUserData({
        firstName: new ValibotNonEmptyString('John'),
        lastName: new ValibotNonEmptyString('Doe'),
        age: 30
    });

    expect(userData).toEqual({
        firstName: expect.any(ValibotNonEmptyString),
        lastName: expect.any(ValibotNonEmptyString),
        age: 30
    });

    expect(
        () =>
            new ValibotUserData({
                firstName: new ValibotNonEmptyString('John'),
                lastName: new ValibotNonEmptyString('Doe'),
                age: -30
            })
    ).toThrowError(TypeParsingError);
});

test('joi', () => {
    class JoiNonEmptyString extends domainType(
        Joi.string().min(1).required()
    ) {}

    const nonEmptyString = new JoiNonEmptyString('non-empty');
    expect(nonEmptyString.value).toBe('non-empty');

    expect(() => new JoiNonEmptyString('')).toThrowError(
        TypeParsingError
    );

    class JoiUserData extends domainType(
        Joi.object({
            firstName: Joi.object().instance(JoiNonEmptyString).required(),
            lastName: Joi.object().instance(JoiNonEmptyString).required(),
            age: Joi.number().integer().positive().required()
        })
    ) {}

    const userData = new JoiUserData({
        firstName: new JoiNonEmptyString('John'),
        lastName: new JoiNonEmptyString('Doe'),
        age: 30
    });

    expect(userData).toEqual({
        firstName: expect.any(JoiNonEmptyString),
        lastName: expect.any(JoiNonEmptyString),
        age: 30
    });

    expect(
        () =>
            new JoiUserData({
                firstName: new JoiNonEmptyString('John'),
                lastName: new JoiNonEmptyString('Doe'),
                age: -30
            })
    ).toThrowError(TypeParsingError);
});

test('README example', () => {
    class UserId extends domainType(z.string().nonempty()) {
        static get randomId() {
            return new UserId(Math.random().toString());
        }
    }

    class User extends domainType(
        z.object({
            id: z.instanceof(UserId),
            name: z.string().nonempty()
        })
    ) {
        withNewName = (name: string) => {
            return new User({
                id: this.id,
                name
            });
        };
    }

    const user = new User({
        id: UserId.randomId,
        name: 'First User'
    });

    console.log(user.name); // 'First User'
    /**
     * Non-object domain types are exposed through the `value` property.
     */
    console.log(user.id.value); // 'user-1'

    console.log(user.withNewName('Test Name').name); // 'Test Name'

    try {
        const _invalidUserId = new UserId('');
    } catch (e: unknown) {
        if (e instanceof TypeParsingError) {
            console.error(e.details.parsingIssues);
            console.error(e.details.value);
        }
    }

    expect(true).toBe(true);
});

test('recursive', () => {
    class Node extends recursiveDomainType((isNode) => {
        return z.object({
            id: z.string().nonempty(),
            linkedNode: z.custom<Node>(isNode).optional()
        });
    }) {}

    const node = new Node({ id: '1' });
    const nodeWithLink = new Node({ id: '2', linkedNode: node });
    console.log(nodeWithLink);
    expect(true).toBe(true);
});
