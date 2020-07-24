# Setup Terraform docs Action

A GitHub action that installs a [Terraform docs](https://github.com/terraform-docs/terraform-docs) executable in the PATH.

## Inputs

### `terraform_docs_version`

**Required** The version of Terraform docs which will be installed.
See [Terraform docs releases page](https://github.com/terraform-docs/terraform-docs/releases) for valid versions.

If version is `"latest"`, the action will get the latest version number using [Octokit](https://octokit.github.io/rest.js/).

Default `"latest"`.

### `token`

If set, token will be used for Octokit authentication. Authenticating will increase the [API rate limit](https://developer.github.com/v3/#rate-limiting).

## Outputs

The action does not have any output.

## Usage

```yaml
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

For latest release you can omit version variable and use
```yaml
- uses: lablabs/setup-terraform-docs@v1
```
or specify it explicitly as
```yaml
- uses: lablabs/setup-terraform-docs@v1
  with:
    terraform_docs_version: latest
```

For authenticating with the [GITHUB_TOKEN](https://docs.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token) you can use
```yaml
- uses: lablabs/setup-terraform-docs@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
```
