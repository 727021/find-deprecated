# find-deprecated

> A node package for finding deprecated project dependencies

[![NPM Version](https://img.shields.io/npm/v/find-deprecated.svg)](https://npmjs.org/package/find-deprecated)

## Usage

### Installation

```bash
npm install --save-dev find-deprecated
```

### Example script

```js
const findDeprecated = require('find-deprecated')
const { dependencies } = require('./package.json')

findDeprecated(Object.keys(dependencies))
  .then(({
    checked,
    deprecated,
    totalChecked,
    totalDeprecated
  }) => {
    if (deprecated.length === 0) {
      console.log("Nothing is deprecated. You\'re doing great!")
    } else {
      deprecated.forEach(({ dependency, notice }) => {
        console.log(`${dependency} is deprecated: ${notice}`)
      })
    }
  })
  .catch(({ error, output, dependency }) => {
    console.log(`Failed on dependency ${dependency}`)
    console.log(output)
    console.log(error)
  })
```

The `find-deprecated` package exports a single function, `findDeprecated`, which returns a promise.

The returned promise resolves with the following object:

```ts
{
  checked: string[] // A list of dependencies that were checked
  deprecated: {
    dependency: string // The name of the dependency
    notice: string // The deprecation notice from NPM
  }[] // A list of deprecated dependencies
  totalChecked: number // The number of dependencies that were checked
  totalDeprecated: number // The number of dependencies that are deprecated
}
```

If an error occurs while checking dependencies, the promise will reject with the following object:

```ts
{
  error: ExecException | null // The error thrown by `exec`
  output: string // stderr from the npm process that failed
  dependency: string // The name of the dependency that was being checked
}
```

## CLI Usage

```bash
find-deprecated --d(ir) <path> --j(son)
```

### With NPX (Recommended)

```bash
npx find-deprecated
```

### With global install

```bash
npm install --global find-deprecated

find-deprecated
```

### Options

#### Directory (Optional)

`--dir <path>`, `-d <path>`

Relative path to the directory containing package.json

Defaults to `process.cwd()`

#### JSON (Optional)

`--json`, `-j`

Display command output as JSON

Defaults to `false`

## License

[MIT](LICENSE.md)
