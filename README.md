# domineer.ts

Ultra-strict and *very* opinionated ESLint configuration,
**domineer.ts** is designed to stop all bikeshedding 
by taking a firm stance on all the formatting and code-patterns it can.

**domineer.ts** are for those who like `Standard` or `Prettier` 
but wish they were **even more opinionated**.

**domineer.ts** is intended to retire as many discussions on code-formatting as possible,
whether it's formatting (which quotes to use, where to put commas in arrays, etc.),
or code patterns (don't allow undefined variables, no unresolved references, etc.).
It does this by taking a non-customizable stance on everything
by using ESLint rules to narrow the possibility-space of allowed code,
because **none 👏 of 👏 those 👏 discussions 👏 matter**.

The key point is to stop wasting time 
so you and your team can focus on what matters: **Your business logic**.

Anyone with complaints can come to this project or [tell me on twitter](https://twitter.com/jonlauridsen). 

The [files in the examples folder](./examples) show what strictness is enforced. 

## Usage

Install:
```shell
npm install -D eslint github:gaggle/domineer.ts
```

Then you should configure eslint to use the domineer.ts configuration. 
You can choose a `ts` or `tsReact` preset depending on your needs.

Do this by creating the file `.eslintrc.js`:
```
module.exports = {
  extends: 'eslint-config-si/ts'
}
```

## Contributing

If you can spot a formatting ambiguity 
then please create a pull-request with added/edited examples.

To get started clone this repository and install dependencies:

```shell
git clone git@github.com:gaggle/domineer.ts.git
npm ci
```

Run `npm test` to validate the examples.

## Meaning?

> verb: domineer;
> assert one's will over another in an arrogant way.

This library is ultra-opinionated,
aspiring to remove all possible formatting discussions and ambiguities. 
That's pretty arrogant innit?
