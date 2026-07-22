import { defineErrorClass } from '@domain-first/errors';
import type { StandardSchemaV1 } from '@standard-schema/spec';

export const InvalidDataParsingError = defineErrorClass<{
    parsingIssues: readonly StandardSchemaV1.Issue[];
    value: unknown;
}>({
    code: 'INVALID_DATA_PARSING'
});
