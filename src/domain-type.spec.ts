import { expect, test } from '@rstest/core';
import Joi from 'joi';
import * as v from 'valibot';
import z from 'zod';
import { domainType, recursiveDomainType } from './domain-type';
import { DirectConstructionError, TypeParsingError } from './errors';

test('zod', () => {
    class ZodNonEmptyString extends domainType(z.string().nonempty()) {}

    const nonEmptyString = ZodNonEmptyString.of('non-empty');
    expect(nonEmptyString.snapshot).toBe('non-empty');

    expect(() => ZodNonEmptyString.of('')).toThrowError(TypeParsingError);

    class ZodUserData extends domainType(
        z.object({
            firstName: z.instanceof(ZodNonEmptyString),
            lastName: z.instanceof(ZodNonEmptyString),
            age: z.int().positive()
        })
    ) {}

    const userData = ZodUserData.of({
        firstName: ZodNonEmptyString.of('John'),
        lastName: ZodNonEmptyString.of('Doe'),
        age: 30
    });

    expect(userData).toEqual({
        firstName: expect.any(ZodNonEmptyString),
        lastName: expect.any(ZodNonEmptyString),
        age: 30
    });

    expect(() =>
        ZodUserData.of({
            firstName: ZodNonEmptyString.of('John'),
            lastName: ZodNonEmptyString.of('Doe'),
            age: -30
        })
    ).toThrowError(TypeParsingError);
});

test('valibot', () => {
    class ValibotNonEmptyString extends domainType(
        v.pipe(v.string(), v.nonEmpty())
    ) {}

    const nonEmptyString = ValibotNonEmptyString.of('non-empty');
    expect(nonEmptyString.snapshot).toBe('non-empty');

    expect(() => ValibotNonEmptyString.of('')).toThrowError(TypeParsingError);

    class ValibotUserData extends domainType(
        v.object({
            firstName: v.instance(ValibotNonEmptyString),
            lastName: v.instance(ValibotNonEmptyString),
            age: v.pipe(v.number(), v.integer(), v.minValue(1))
        })
    ) {}

    const userData = ValibotUserData.of({
        firstName: ValibotNonEmptyString.of('John'),
        lastName: ValibotNonEmptyString.of('Doe'),
        age: 30
    });

    expect(userData).toEqual({
        firstName: expect.any(ValibotNonEmptyString),
        lastName: expect.any(ValibotNonEmptyString),
        age: 30
    });

    expect(() =>
        ValibotUserData.of({
            firstName: ValibotNonEmptyString.of('John'),
            lastName: ValibotNonEmptyString.of('Doe'),
            age: -30
        })
    ).toThrowError(TypeParsingError);
});

test('joi', () => {
    class JoiNonEmptyString extends domainType(
        Joi.string().min(1).required()
    ) {}

    const nonEmptyString = JoiNonEmptyString.of('non-empty');
    expect(nonEmptyString.snapshot).toBe('non-empty');

    expect(() => JoiNonEmptyString.of('')).toThrowError(TypeParsingError);

    class JoiUserData extends domainType(
        Joi.object({
            firstName: Joi.object().instance(JoiNonEmptyString).required(),
            lastName: Joi.object().instance(JoiNonEmptyString).required(),
            age: Joi.number().integer().positive().required()
        })
    ) {}

    const userData = JoiUserData.of({
        firstName: JoiNonEmptyString.of('John'),
        lastName: JoiNonEmptyString.of('Doe'),
        age: 30
    });

    expect(userData).toEqual({
        firstName: expect.any(JoiNonEmptyString),
        lastName: expect.any(JoiNonEmptyString),
        age: 30
    });

    expect(() =>
        JoiUserData.of({
            firstName: JoiNonEmptyString.of('John'),
            lastName: JoiNonEmptyString.of('Doe'),
            age: -30
        })
    ).toThrowError(TypeParsingError);
});

test('README example', () => {
    class UserId extends domainType(z.string().nonempty()) {
        static get randomId() {
            return UserId.of(Math.random().toString());
        }
    }

    class User extends domainType(
        z.object({
            id: z.instanceof(UserId),
            name: z.string().nonempty()
        })
    ) {
        withNewName = (name: string) => {
            return User.of({
                ...this.snapshot,
                name
            });
        };
    }

    const user = User.of({
        id: UserId.randomId,
        name: 'First User'
    });

    console.log(user.name); // 'First User'
    /**
     * Non-object domain types are exposed through the `snapshot` getter.
     */
    console.log(user.id.snapshot); // 'user-1'

    console.log(user.withNewName('Test Name').name); // 'Test Name'

    try {
        const _invalidUserId = UserId.of('');
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

    const node = Node.of({ id: '1' });
    const nodeWithLink = Node.of({ id: '2', linkedNode: node });
    console.log(nodeWithLink);
    expect(true).toBe(true);
});

test('with', () => {
    class User extends domainType(
        z.object({
            name: z.string().nonempty(),
            age: z.int().positive()
        })
    ) {
        get isAdult() {
            return this.age >= 18;
        }
    }

    const user = User.of({ name: 'John', age: 17 });
    const olderUser = user.with({ age: 18 });

    expect(olderUser).toBeInstanceOf(User);
    expect(olderUser).not.toBe(user);
    expect(olderUser.isAdult).toBe(true);
    expect(olderUser).toEqual({ name: 'John', age: 18 });
    expect(user).toEqual({ name: 'John', age: 17 });

    expect(() => user.with({ age: -1 })).toThrowError(TypeParsingError);

    class Admin extends User {
        get role() {
            return 'admin' as const;
        }
    }

    const admin = Admin.of({ name: 'Jane', age: 30 }).with({ name: 'Ann' });

    expect(admin).toBeInstanceOf(Admin);
    expect(admin.role).toBe('admin');
    expect(admin.name).toBe('Ann');
});

test('built-in object outputs are available via snapshot', () => {
    class CreatedAt extends domainType(z.date()) {}
    class Tags extends domainType(z.map(z.string(), z.number())) {}
    class Names extends domainType(z.array(z.string())) {}

    const date = new Date(0);
    const createdAt = CreatedAt.of(date);
    expect(createdAt.snapshot).toBe(date);
    expect(createdAt.snapshot.getTime()).toBe(0);
    // @ts-expect-error methods are not copied to the instance
    expect(() => createdAt.getTime()).toThrowError(TypeError);

    const tags = Tags.of(new Map([['a', 1]]));
    expect(tags.snapshot.get('a')).toBe(1);

    const names = Names.of(['John', 'Jane']);
    expect(names.snapshot).toEqual(['John', 'Jane']);
    expect(Object.keys(names)).toEqual([]);
    // @ts-expect-error arrays are not spread into fields
    expect(names[0]).toBeUndefined();
    // @ts-expect-error arrays have no `with`
    expect(() => names.with([])).toThrowError(TypeParsingError);
});

test('null-prototype object outputs are spread into fields', () => {
    const model = Object.assign(Object.create(null), { name: 'John' });

    class User extends domainType(z.custom<{ name: string }>(() => true)) {}

    expect(User.of(model).name).toBe('John');
});

test('class instance outputs are spread into fields', () => {
    class Point {
        constructor(
            public x: number,
            public y: number
        ) {}

        get length() {
            return Math.hypot(this.x, this.y);
        }

        scale(factor: number) {
            return new Point(this.x * factor, this.y * factor);
        }
    }

    class Position extends domainType(z.instanceof(Point)) {}

    const position = Position.of(new Point(1, 2));
    expect(position.x).toBe(1);
    expect(position.y).toBe(2);
    expect(position.snapshot).toBeInstanceOf(Point);
    expect(position.snapshot.scale(2).x).toBe(2);
    // @ts-expect-error methods are not copied to the instance
    expect(() => position.scale(2)).toThrowError(TypeError);
});

test('snapshot getter', () => {
    class Age extends domainType(z.number().int()) {}
    class User extends domainType(z.object({ name: z.string() })) {}

    const age = Age.of(30);
    expect(age.snapshot).toBe(30);
    expect(Object.keys(age)).toEqual([]);

    const user = User.of({ name: 'John' });
    expect(user.snapshot).toEqual({ name: 'John' });
    expect(Object.keys(user)).toEqual(['name']);
});

test('instance exposes only data fields', () => {
    class User extends domainType(z.object({ name: z.string() })) {}

    const user = User.of({ name: 'John' });
    expect(Object.getOwnPropertyNames(user)).toEqual(['name']);
    expect(Reflect.ownKeys(user)).toHaveLength(3);
});

test('static and instance of', () => {
    class Counter extends domainType(z.number().int().nonnegative()) {
        get incremented() {
            return this.of((x) => x + 1);
        }
    }

    const counter = Counter.of(1);
    expect(counter.incremented).toBeInstanceOf(Counter);
    expect(counter.incremented.snapshot).toBe(2);
    expect(Counter.of(10).snapshot).toBe(10);
    expect(Counter.of(10)).toBeInstanceOf(Counter);
    expect(counter.snapshot).toBe(1);
    expect(() => counter.of((x) => x - 2)).toThrowError(TypeParsingError);

    class Names extends domainType(z.array(z.string())) {}
    const names = Names.of(['a']).of((current) => [...current, 'b']);
    expect(names.snapshot).toEqual(['a', 'b']);

    class User extends domainType(z.object({ name: z.string() })) {}
    class Admin extends User {
        get role() {
            return 'admin' as const;
        }
    }

    const admin = Admin.of({ name: 'John' }).of(({ name }) => ({
        name: name.toUpperCase()
    }));
    expect(admin).toBeInstanceOf(Admin);
    expect(admin.role).toBe('admin');
    expect(admin.name).toBe('JOHN');
});

test('constructor is private', () => {
    class Age extends domainType(z.number()) {}

    // @ts-expect-error the constructor requires a private token
    expect(() => new Age(30)).toThrowError(DirectConstructionError);
    // @ts-expect-error the constructor requires a private token
    expect(() => new Age(Symbol('constructor'), 30)).toThrowError(
        DirectConstructionError
    );
});
