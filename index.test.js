const os = require("os");

const core = require("@actions/core");
const io = require("@actions/io");
const tc = require("@actions/tool-cache");

const index = require("./index");

jest.mock("@actions/core");
jest.mock("@actions/tool-cache");
jest.mock("os");

describe("Mock tests", () => {
  const HOME = process.env.HOME;
  const APPDATA = process.env.APPDATA;

  beforeEach(() => {
    process.env.HOME = "/tmp/asdf";
    process.env.APPDATA = "/tmp/asdf";
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await io.rmRF(process.env.HOME);
    process.env.HOME = HOME;
    process.env.APPDATA = APPDATA;
  });

  test("gets specified version on linux amd64", async () => {
    const version = "v0.16.0";

    core.getInput = jest.fn().mockReturnValueOnce(version);

    tc.downloadTool = jest.fn().mockReturnValueOnce("file.tar.gz");

    tc.extractTar = jest.fn().mockReturnValueOnce("file");

    os.platform = jest.fn().mockReturnValue("linux");

    os.arch = jest.fn().mockReturnValue("amd64");

    await index.run();

    expect(tc.downloadTool.mock.calls[0][0]).toBe(
      "https://github.com/terraform-docs/terraform-docs/releases/download/v0.16.0/terraform-docs-v0.16.0-linux-amd64.tar.gz"
    );
    expect(tc.downloadTool).toBeCalledTimes(1);
    expect(core.addPath).toBeCalledTimes(1);
  });

  test("gets specified version on windows 386", async () => {
    const version = "v0.16.0";

    core.getInput = jest.fn().mockReturnValueOnce(version);

    tc.downloadTool = jest.fn().mockReturnValueOnce("file.zip");

    tc.extractZip = jest.fn().mockReturnValueOnce("file");

    os.platform = jest.fn().mockReturnValue("win32");

    os.arch = jest.fn().mockReturnValue("386");

    await index.run();

    expect(tc.downloadTool.mock.calls[0][0]).toBe(
      "https://github.com/terraform-docs/terraform-docs/releases/download/v0.16.0/terraform-docs-v0.16.0-windows-386.exe"
    );
    expect(tc.downloadTool).toBeCalledTimes(1);
    expect(core.addPath).toBeCalledTimes(1);
  });
});
