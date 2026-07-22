import type { StandardSchemaV1 } from '@standard-schema/spec';
import {
    AsyncSchemaInSyncParsingError,
    InvalidDataParsingError
} from '../errors';

export function parseSync<S extends StandardSchemaV1>(
    schema: S,
    value: StandardSchemaV1.InferInput<S>
): StandardSchemaV1.InferOutput<S> {
    const result = schema['~standard'].validate(value);

    if (result instanceof Promise) {
        throw new AsyncSchemaInSyncParsingError({ schema, value });
    }

    if ('issues' in result && result.issues) {
        throw new InvalidDataParsingError({
            parsingIssues: result.issues,
            value
        });
    }

    return result.value;
}
