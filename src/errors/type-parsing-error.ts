import type { StandardSchemaV1 } from '@standard-schema/spec';
import { DomainFirstTypesError } from './namespace';

export const TypeParsingError = DomainFirstTypesError.error<{
    parsingIssues: readonly StandardSchemaV1.Issue[];
    value: unknown;
}>('INVALID_DATA');
