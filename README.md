# Setup Terraform docs Action

A GitHub action that installs a [Terraform docs](https://github.com/terraform-docs/terraform-docs) executable in the PATH.

## Inputs

### `terraform_docs_version`

The version of Terraform docs which will be installed.
See [Terraform docs releases page](https://github.com/terraform-docs/terraform-docs/releases) for valid versions.

## Outputs

The action does not have any output.

## Usage

```
name: Test
on:
  push:
    branches: [ master ]

jobs:
  example-job:
  runs-on: ${{ matrix.os }}

  strategy:
    matrix:
      os: [ubuntu-latest, macos-latest, windows-latest]

  steps:
    - uses: actions/checkout@v1
      name: Checkout source code

    - uses: lablabs/setup-terraform-docs@v1
      name: Setup Terraform docs
      with:
        terraform_docs_version: v0.9.1

    - shell: bash
      run: |
        terraform-docs --version
```
