import { defineErrorClass } from '@domain-first/errors';

export const StructuredCloneNotFoundError = defineErrorClass({
    code: 'STRUCTURED_CLONE_NOT_FOUND'
});
