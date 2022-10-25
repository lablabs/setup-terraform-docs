const os = require("os");

const core = require("@actions/core");
const tc = require("@actions/tool-cache");
const { Octokit } = require("@octokit/rest");

async function run() {
  // Gather OS details
  const osPlatform = os.platform();
  const osArch = os.arch();

  if (isSupportedPlatform(osPlatform)) {
    try {
      const version = await getTerraformDocsVersion();

      const platform = mapOS(osPlatform);
      const arch = mapArch(osArch);
      const url = getDownloadUrl(version, platform, arch);
      core.debug(
        `Downloading Terraform docs version [${version}] for platform [${platform}-${arch}] from [${url}]`
      );

      const terraformDocsDownload = await tc.downloadTool(url);

      if (!terraformDocsDownload) {
        throw new Error(`Unable to download Terraform-docs from ${url}`);
      }

      let terraformDocsPath = "";

      if (platform == "windows") {
        terraformDocsPath = await tc.extractZip(terraformDocsDownload);
      } else {
        terraformDocsPath = await tc.extractTar(terraformDocsDownload);
      }

      if (!terraformDocsPath) {
        throw new Error(`Unable to extract Terraform-docs archive`);
      }

      core.debug(`Adding [${terraformDocsPath}] into PATH`);
      core.addPath(terraformDocsPath);
    } catch (error) {
      core.error(error);
      throw error;
    }
  }
}

// arch in [arm, x32, x64...] (https://nodejs.org/api/os.html#os_os_arch)
// return value in [amd64, 386, arm]
function mapArch(arch) {
  const mappings = {
    x32: "386",
    x64: "amd64",
  };
  return mappings[arch] || arch;
}

// os in [darwin, linux, win32...] (https://nodejs.org/api/os.html#os_os_platform)
// return value in [darwin, linux, windows]
function mapOS(os) {
  const mappings = {
    win32: "windows",
  };
  return mappings[os] || os;
}

function mapOSExtension(os) {
  const mappings = {
    windows: "exe",
    linux: "tar.gz",
    darwin: "tar.gz",
  };
  return mappings[os];
}

function isSupportedPlatform(platform) {
  const supportedPlatforms = ["win32", "linux", "darwin"];
  if (supportedPlatforms.includes(platform)) {
    return true;
  } else {
    throw new Error(
      `Your platform (${platform}) is not supported by the action.
      Supported platforms: ${supportedPlatforms}`
    );
  }
}

function getOctokit() {
  const options = {};
  const token = core.getInput("token");
  if (token) {
    core.debug("Using token authentication for Octokit");
    options.auth = token;
  }
  return new Octokit(options);
}

async function getTerraformDocsVersion() {
  const inputVersion = core.getInput("terraform_docs_version", {
    required: true,
  });
  if (inputVersion == "latest") {
    core.debug("Requesting for [latest] version ...");
    const octokit = getOctokit();
    const response = await octokit.repos.getLatestRelease({
      owner: "terraform-docs",
      repo: "terraform-docs",
    });
    core.debug(`... version resolved to [${response.data.name}`);
    return response.data.name;
  } else {
    return inputVersion;
  }
}

function getDownloadUrl(version, platform, arch) {
  const baseUrl =
    "https://github.com/terraform-docs/terraform-docs/releases/download";
  const extension = mapOSExtension(platform);
  const fileName = `terraform-docs-${version}-${platform}-${arch}.${extension}`;
  return `${baseUrl}/${version}/${fileName}`;
}

// RUN THE ACTION
run().catch((error) => core.setFailed(error.message));

module.exports = { run };
