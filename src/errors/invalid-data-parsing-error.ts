import { errorNamespace } from '@domain-first/errors';
import type { StandardSchemaV1 } from '@standard-schema/spec';

const ParsingErrors = errorNamespace("PARSING")

export const InvalidDataParsingError = ParsingErrors.error<{
    parsingIssues: readonly StandardSchemaV1.Issue[];
    value: unknown;
}>('INVALID_DATA');
