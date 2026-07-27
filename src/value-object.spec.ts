import { expect, test } from '@rstest/core';
import Joi from 'joi';
import * as v from 'valibot';
import z from 'zod';

import { InvalidDataParsingError } from './errors';
import { defineValueObject } from './value-object';

test('zod', () => {
    class ZodNonEmptyString extends defineValueObject(z.string().nonempty()) {}

    const nonEmptyString = new ZodNonEmptyString('non-empty');
    expect(nonEmptyString.model).toBe('non-empty');

    expect(() => new ZodNonEmptyString('')).toThrowError(
        InvalidDataParsingError
    );

    class ZodUserData extends defineValueObject(
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

    expect(userData.model).toEqual({
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
    ).toThrowError(InvalidDataParsingError);
});

test('valibot', () => {
    class ValibotNonEmptyString extends defineValueObject(
        v.pipe(v.string(), v.nonEmpty())
    ) {}

    const nonEmptyString = new ValibotNonEmptyString('non-empty');
    expect(nonEmptyString.model).toBe('non-empty');

    expect(() => new ValibotNonEmptyString('')).toThrowError(
        InvalidDataParsingError
    );

    class ValibotUserData extends defineValueObject(
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

    expect(userData.model).toEqual({
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
    ).toThrowError(InvalidDataParsingError);
});

test('joi', () => {
    class JoiNonEmptyString extends defineValueObject(
        Joi.string().min(1).required()
    ) {}

    const nonEmptyString = new JoiNonEmptyString('non-empty');
    expect(nonEmptyString.model).toBe('non-empty');

    expect(() => new JoiNonEmptyString('')).toThrowError(
        InvalidDataParsingError
    );

    class JoiUserData extends defineValueObject(
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

    expect(userData.model).toEqual({
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
    ).toThrowError(InvalidDataParsingError);
});
