import "dotenv/config";
import ora from "ora";
import chalk from "chalk";

interface HealthCheck {
  id: string;
  label: string;
  status: "ok" | "warning" | "error";
  detail?: string;
}

async function main() {
  const spinner = ora("Running platform diagnostics...").start();
  try {
    const response = await fetch("http://localhost:3000/api/admin/health", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) {
      spinner.fail("Health API unavailable. Are you logged in as admin?");
      process.exitCode = 1;
      return;
    }
    const payload = (await response.json()) as { checks: HealthCheck[] };
    spinner.succeed("Diagnostics complete");

    for (const check of payload.checks) {
      const icon =
        check.status === "ok"
          ? chalk.green("●")
          : check.status === "warning"
          ? chalk.yellow("●")
          : chalk.red("●");
      const label = chalk.bold(check.label);
      console.log(`${icon} ${label}`);
      if (check.detail) {
        console.log(`   ${chalk.gray(check.detail)}`);
      }
    }

    const hasErrors = payload.checks.some((check) => check.status === "error");
    if (hasErrors) {
      process.exitCode = 1;
    }
  } catch (error) {
    spinner.fail(`Diagnostics failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

void main();

