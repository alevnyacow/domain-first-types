import { errorNamespace } from '@domain-first/errors';

const SchemaErrors = errorNamespace('SCHEMA')

export const AsyncSchemaInSyncParsingError = SchemaErrors.error('ASYNC_LOGIC');
