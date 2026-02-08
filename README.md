# ESTH

Production-oriented artifact validation harness for Ethereum execution plans.

## Features
- Strict artifact loading and structural validation.
- Rule engine with protocol-specific semantics for Aave V3, Balancer V2, and Uniswap V4.
- Machine-readable CLI output for automation and CI.
- License enforcement (`ESTH_LICENSE_KEY` or `--licensePath`).
- Modern light GUI report (`--gui`) for visual review.

## Install
```bash
npm install
npm run build
```

## Licensing
A license key is required to run ESTH.

Format:
```text
holder|plan|signature
```

Use an environment variable or file:
```bash
export ESTH_LICENSE_KEY='acme|enterprise|<signature>'
# or
node dist/cli/esth.js ... --licensePath ./license.key
```

For local smoke tests, use this sample key (derived from the built-in test secret):
```text
acme|enterprise|71f4bd773d844b75abeadc524c48ccd30485fa179794858f76e4410dcc4f3750
```

## CLI
```bash
node dist/cli/esth.js \
  --executionPlan examples/executionPlan.json \
  --abiRegistry examples/abiRegistry.json \
  --loanRegistry examples/loanRegistry.json \
  --gui --port 4173
```

Exit codes:
- `0`: PASS
- `2`: FAIL (validation/rules)
- `3`: missing license
- `4`: invalid license
- `99`: fatal runtime error

## Project Layout
```text
esth/
  package.json
  tsconfig.json
  src/
    cli/
      esth.ts
    types/
      artifacts.ts
      verdict.ts
    core/
      fsLoader.ts
      schemaGuard.ts
      planIndex.ts
      engine.ts
      license.ts
    rules/
      index.ts
      aaveV3.ts
      balancerV2.ts
      uniswapV4.ts
    gui/
      reportServer.ts
```
