const fs = require('fs')
const os = require('os')
const path = require('path')
const process = require('process')

const core = require('@actions/core')
const tc = require('@actions/tool-cache')


async function run() {
  if (isSupportedPlatform(process.platform)) {
    const version = getTerraformDocsVersion()
    const url = getDownloadUrl(getTerraformDocsVersion(), process.platform)

    const targetPath = getTargetPath()
    core.debug(`Downloading Terraform docs version [${version}] for platform [${process.platform}] from [${url}] to destination [${targetPath}]`)
    const terraformDocsPath = await tc.downloadTool(url, targetPath)

    makeFileExecutable(terraformDocsPath)

    core.debug(`Adding [${getTargetDirectory()}] into PATH`)
    core.addPath(getTargetDirectory())
  }
}

function getTargetDirectory() {
  return path.join(os.homedir(), 'terraform_docs', 'bin')
}

function getTargetPath() {
  return path.join(getTargetDirectory(), 'terraform-docs')
}

function isSupportedPlatform(platform) {
  const supportedPlatforms = ['win32', 'linux', 'darwin']
  if (supportedPlatforms.includes(platform)) {
    return true;
  } else {
    throw new Error(
      `Your platform (${platform}) is not supported by the action.
      Supported platforms: ${supportedPlatforms}`
    )
  }
}

function isWindows() {
  return process.platform == 'win32'
}

function getTerraformDocsVersion() {
  return "v0.9.1"
  // return core.getInput('terraform_docs_version');
}

function getDownloadUrl(version, platform) {
  const baseUrl = "https://github.com/terraform-docs/terraform-docs/releases/download"
  const fileName = getDownloadFilename(version, platform)
  return `${baseUrl}/${version}/${fileName}`
}

function getDownloadFilename(version, platform) {
  const fileNamePlatformMatrix = {
    win32: 'windows-amd64.exe',
    darwin: 'darwin-amd64',
    linux: 'linux-amd64'
  }
  return `terraform-docs-${version}-${fileNamePlatformMatrix[platform]}`
}

function makeFileExecutable(filename) {
  if (!isWindows()) {
    const chmod = '755'
    core.debug(`Setting chmod [${filename}] to [${chmod}]`)
    fs.chmodSync(`${filename}`, chmod)
  }
}


// RUN THE ACTION
run().catch((error) => core.setFailed(error.message))

module.exports = { run, makeFileExecutable }
