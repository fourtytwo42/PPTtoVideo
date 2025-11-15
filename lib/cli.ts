import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function runCommand(command: string, args: string[], options: { cwd?: string } = {}) {
  try {
    const { stdout, stderr } = await execFileAsync(command, args, options);
    if (stderr) {
      console.warn(stderr);
    }
    return stdout;
  } catch (error) {
    console.error(`Command ${command} failed`, error);
    throw error;
  }
}
