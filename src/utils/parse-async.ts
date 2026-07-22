import type { StandardSchemaV1 } from '@standard-schema/spec';
import { InvalidDataParsingError } from '../errors';

export async function parseAsync<S extends StandardSchemaV1>(
    schema: S,
    value: StandardSchemaV1.InferInput<S>
): Promise<StandardSchemaV1.InferOutput<S>> {
    const result = await schema['~standard'].validate(value);

    if ('issues' in result && result.issues) {
        throw new InvalidDataParsingError({
            parsingIssues: result.issues,
            value
        });
    }

    return result.value;
}
