#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const changelogPath = path.join(repoRoot, "CHANGELOG.md");
const packageJsonPath = path.join(repoRoot, "package.json");
const args = process.argv.slice(2);

const versionArg = getArgValue("--version");
const currentVersion = args.includes("--current");
const outputPath = getArgValue("--output");

function getArgValue(flag) {
    const index = args.indexOf(flag);

    if (index === -1 || index === args.length - 1) {
        return null;
    }

    return args[index + 1];
}

function getTargetVersion() {
    if (versionArg) {
        return versionArg.replace(/^v/, "");
    }

    if (currentVersion) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        return packageJson.version;
    }

    throw new Error("Provide --version <x.y.z> or --current.");
}

function extractSection(changelog, version) {
    const escapedVersion = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const sectionPattern = new RegExp(`## \\[${escapedVersion}\\] - .*?(?=\\n## \\[|$)`, "s");
    const match = changelog.match(sectionPattern);

    if (!match) {
        throw new Error(`Version ${version} was not found in CHANGELOG.md.`);
    }

    return `${match[0].trim()}\n`;
}

function main() {
    const targetVersion = getTargetVersion();
    const changelog = fs.readFileSync(changelogPath, "utf8");
    const section = extractSection(changelog, targetVersion);

    if (outputPath) {
        fs.writeFileSync(path.resolve(repoRoot, outputPath), section, "utf8");
    }

    process.stdout.write(section);
}

try {
    main();
} catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
}
