import { defineErrorClass } from '@domain-first/errors';

export const AsyncSchemaInSyncParsingError = defineErrorClass({
    code: 'ASYNC_SCHEMA_IN_SYNC_PARSING'
});
