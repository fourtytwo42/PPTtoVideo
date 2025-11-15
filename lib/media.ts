import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function probeDuration(filePath: string): Promise<number | null> {
  const ffprobe = process.env.FFPROBE_PATH ?? "ffprobe";
  try {
    const { stdout } = await execFileAsync(ffprobe, [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "json",
      filePath,
    ]);
    const parsed = JSON.parse(stdout);
    const duration = Number(parsed?.format?.duration);
    if (Number.isFinite(duration)) {
      return duration;
    }
    return null;
  } catch (error) {
    console.warn(`ffprobe failed for ${filePath}`, error);
    return null;
  }
}
