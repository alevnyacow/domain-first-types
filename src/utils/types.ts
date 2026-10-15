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
 */
export type DataFields<T> = T extends unknown
    ? {
          [K in keyof T as T[K] extends (...args: any[]) => any
              ? never
              : K]: T[K];
      }
    : never;

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
