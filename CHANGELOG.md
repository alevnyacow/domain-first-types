## [5.0.2](https://github.com/alevnyacow/domain-first-types/compare/v5.0.1...v5.0.2) (2026-08-06)


### Bug Fixes

* updated badges ([8b5ce82](https://github.com/alevnyacow/domain-first-types/commit/8b5ce82c75df6a71a30f7055d7ec4a897242c039))

## [5.0.1](https://github.com/alevnyacow/domain-first-types/compare/v5.0.0...v5.0.1) (2026-08-04)


### Bug Fixes

* error name in README ([2d620b4](https://github.com/alevnyacow/domain-first-types/commit/2d620b4dc1c712909a8f44eff5dcf3275178aa31))

# [5.0.0](https://github.com/alevnyacow/domain-first-types/compare/v4.0.0...v5.0.0) (2026-08-04)


### Features

* errors refactoring, shared namespace ([4723447](https://github.com/alevnyacow/domain-first-types/commit/47234476ba51ec82e81df73566be92c805876b26))


### BREAKING CHANGES

* `InvalidDataParsingError` -> `TypeParsingError`

# [4.0.0](https://github.com/alevnyacow/domain-first-types/compare/v3.0.7...v4.0.0) (2026-08-04)


### Features

* new universal contract, removed `model` concept, removed ([025fdf6](https://github.com/alevnyacow/domain-first-types/commit/025fdf652683813303e8222fd362ee58bdf5001a))


### BREAKING CHANGES

* new API, use `domainType` and `recursiveDomainType` from this
version

## [3.0.7](https://github.com/alevnyacow/domain-first-types/compare/v3.0.6...v3.0.7) (2026-08-03)


### Bug Fixes

* upgraded `@domain-first/errors` ([8f378a7](https://github.com/alevnyacow/domain-first-types/commit/8f378a763b03baa2f6b9dae486cc1cd4d8e53776))

## [3.0.6](https://github.com/alevnyacow/domain-first-types/compare/v3.0.5...v3.0.6) (2026-07-28)


### Bug Fixes

* updated codesandbox line ([8018a89](https://github.com/alevnyacow/domain-first-types/commit/8018a89ab111da461a1c857e0e5a89191ccf7372))

## [3.0.5](https://github.com/alevnyacow/domain-first-types/compare/v3.0.4...v3.0.5) (2026-07-27)


### Bug Fixes

* added entry file for codesandbox ([9c71d73](https://github.com/alevnyacow/domain-first-types/commit/9c71d73589ee03d310f31ddf70b74b3de626a99d))

## [3.0.4](https://github.com/alevnyacow/domain-first-types/compare/v3.0.3...v3.0.4) (2026-07-27)


### Bug Fixes

* added codesandbox demo as homepage ([8e47ddc](https://github.com/alevnyacow/domain-first-types/commit/8e47ddcd02c4dc77f2708d5a90c331ee5337e134))

## [3.0.3](https://github.com/alevnyacow/domain-first-types/compare/v3.0.2...v3.0.3) (2026-07-27)


### Bug Fixes

* value object tests with `zod`, `valibot`, `joi` ([ce4e00c](https://github.com/alevnyacow/domain-first-types/commit/ce4e00c3fc1932e171d6fd407377bee907bfdd23))

## [3.0.2](https://github.com/alevnyacow/domain-first-types/compare/v3.0.1...v3.0.2) (2026-07-25)


### Bug Fixes

* updated @domain-first/errors version to `^1.7.5` ([3b947d4](https://github.com/alevnyacow/domain-first-types/commit/3b947d49015da69bf9d5e9999aed3f302aa0f62b))

## [3.0.1](https://github.com/alevnyacow/domain-first-types/compare/v3.0.0...v3.0.1) (2026-07-25)


### Bug Fixes

* minifying dist files ([bc676c9](https://github.com/alevnyacow/domain-first-types/commit/bc676c94e65d8118686a8a7cae87e80238a592b4))

# [3.0.0](https://github.com/alevnyacow/domain-first-types/compare/v2.0.2...v3.0.0) (2026-07-25)


### Features

* split defineEntity, defineRecursiveEntity, defineValueObject, ([f1fd284](https://github.com/alevnyacow/domain-first-types/commit/f1fd284b80e59ea9e4f47fc6649ebf94bb2dc522))


### BREAKING CHANGES

* `defineEntity(check => Schema` is not available anymore, use
`defineRecursiveEntity`, same with `defineValueObject` - use
`defineRecursiveValueObject`

## [2.0.2](https://github.com/alevnyacow/domain-first-types/compare/v2.0.1...v2.0.2) (2026-07-24)


### Bug Fixes

* description, subheader, keywords ([cb2c990](https://github.com/alevnyacow/domain-first-types/commit/cb2c9907f2776836bae9c58ba1417744c705f01e))

## [2.0.1](https://github.com/alevnyacow/domain-first-types/compare/v2.0.0...v2.0.1) (2026-07-24)


### Bug Fixes

* `InferInput` instead of `InferOutput` in constructors ([1cb2900](https://github.com/alevnyacow/domain-first-types/commit/1cb29003ada35e20747444b1bb82cc684237afa5))

# [2.0.0](https://github.com/alevnyacow/domain-first-types/compare/v1.0.6...v2.0.0) (2026-07-24)


### Features

* abstract Entities and Value Objects, removed static `is` checker ([40d0a26](https://github.com/alevnyacow/domain-first-types/commit/40d0a26ec6a24c9569201717f3d8ffcc2f954525))


### BREAKING CHANGES

* const Entity = defineEntity(...) is not available anymore,
static `is` is not available anymore

## [1.0.6](https://github.com/alevnyacow/domain-first-types/compare/v1.0.5...v1.0.6) (2026-07-23)


### Bug Fixes

* simplified README ([385721f](https://github.com/alevnyacow/domain-first-types/commit/385721f344c217c4b9f64fc6ec28781f6952731f))

## [1.0.5](https://github.com/alevnyacow/domain-first-types/compare/v1.0.4...v1.0.5) (2026-07-23)


### Bug Fixes

* added Entity export ([cac105c](https://github.com/alevnyacow/domain-first-types/commit/cac105cf3e0fa3de3c02c0de99faf75cdc3a3a84))

## [1.0.4](https://github.com/alevnyacow/domain-first-types/compare/v1.0.3...v1.0.4) (2026-07-23)


### Bug Fixes

* added `ddd` and `domain-driven` keywords ([88f303d](https://github.com/alevnyacow/domain-first-types/commit/88f303df7658c20bc6a6dfbc4c82dafd59d1f657))

## [1.0.3](https://github.com/alevnyacow/domain-first-types/compare/v1.0.2...v1.0.3) (2026-07-23)


### Bug Fixes

* badges in `for-the-badge` style ([3d2969b](https://github.com/alevnyacow/domain-first-types/commit/3d2969b30089f495a7ff29025a0e3975649694dd))

## [1.0.2](https://github.com/alevnyacow/domain-first-types/compare/v1.0.1...v1.0.2) (2026-07-23)


### Bug Fixes

* README improvements ([0fa6145](https://github.com/alevnyacow/domain-first-types/commit/0fa6145b445957aada862292b53e11e572de6f34))

## [1.0.1](https://github.com/alevnyacow/domain-first-types/compare/v1.0.0...v1.0.1) (2026-07-23)


### Bug Fixes

* darker logo, removed unused error ([da7c221](https://github.com/alevnyacow/domain-first-types/commit/da7c2219bf1f09669fcea891689aab3f1401da68))

# 1.0.0 (2026-07-23)


### Features

* added semantic release ([7fd5bb5](https://github.com/alevnyacow/domain-first-types/commit/7fd5bb5b5a4c8f05b15342ef987acd9612780390))
