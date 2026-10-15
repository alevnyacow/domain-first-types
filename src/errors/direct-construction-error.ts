import { DomainFirstTypesError } from './namespace';

export const DirectConstructionError = DomainFirstTypesError.error<{
    className: string;
}>('DIRECT_CONSTRUCTION');
