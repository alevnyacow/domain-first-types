export type DeepReadonly<T> = T extends (...args: any[]) => any
    ? T
    : T extends object
      ? {
            readonly [K in keyof T]: DeepReadonly<T[K]>;
        }
      : T;

/**
 * Own data fields of `T`: everything except methods.
 * Methods live on the prototype, so they are never copied to the instance.
 *
 * Deliberately non-distributive: a class can only extend a constructor whose
 * instance type has statically known members, so a union output
 * (e.g. a discriminated union) collapses to its common keys here.
 * The precise union stays available through `snapshot`.
 */
export type DataFields<T> = OwnDataFields<Pick<T, keyof T>>;

type OwnDataFields<T> = {
    [K in keyof T as T[K] extends (...args: any[]) => any
        ? never
        : K]: T[K];
};

/**
 * Whether the output is spread into instance fields:
 * any non-array object. `any` keeps fields to stay permissive.
 */
export type HasFields<T> = 0 extends 1 & T
    ? true
    : [T] extends [readonly unknown[]]
      ? false
      : [T] extends [object]
        ? true
        : false;
