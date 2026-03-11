#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execSync } from "node:child_process";

const repoRoot = process.cwd();
const packageJsonPath = path.join(repoRoot, "package.json");
const changelogPath = path.join(repoRoot, "CHANGELOG.md");

const SECTION_TITLES = {
    feat: "Features",
    fix: "Fixes",
    refactor: "Refactors",
    test: "Tests",
    docs: "Documentation",
    build: "Build",
    chore: "Chores",
    other: "Other",
};

const BUMP_PRIORITY = {
    none: 0,
    patch: 1,
    minor: 2,
    major: 3,
};

const args = process.argv.slice(2);
const write = args.includes("--write");
const strict = args.includes("--strict");
const manifestPath = getArgValue("--manifest");
const notesPath = getArgValue("--notes");

function getArgValue(flag) {
    const index = args.indexOf(flag);

    if (index === -1 || index === args.length - 1) {
        return null;
    }

    return args[index + 1];
}

function runGit(commandArgs, options = {}) {
    const escapedArgs = commandArgs.map((argument) => {
        if (/^[a-zA-Z0-9._:/=-]+$/.test(argument)) {
            return argument;
        }

        return `"${argument.replace(/"/g, '\\"')}"`;
    });

    return execSync(`git ${escapedArgs.join(" ")}`, {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        shell: true,
        ...options,
    }).trim();
}

function getLatestTag() {
    const tagsOverride = process.env.RELEASE_PREPARE_GIT_TAGS_FILE
        ? fs.readFileSync(path.resolve(repoRoot, process.env.RELEASE_PREPARE_GIT_TAGS_FILE), "utf8")
        : process.env.RELEASE_PREPARE_GIT_TAGS;
    const tags = tagsOverride ?? runGit(["tag", "--list", "v*", "--sort=-version:refname"]);

    if (!tags) {
        return null;
    }

    return tags.split(/\r?\n/).find(Boolean) ?? null;
}

function getCommitRange(latestTag) {
    if (latestTag) {
        return `${latestTag}..HEAD`;
    }

    return "HEAD";
}

function getCommits(range) {
    const logOverride = process.env.RELEASE_PREPARE_GIT_LOG_FILE
        ? fs.readFileSync(path.resolve(repoRoot, process.env.RELEASE_PREPARE_GIT_LOG_FILE), "utf8")
        : process.env.RELEASE_PREPARE_GIT_LOG;
    const rawLog = logOverride ?? runGit(["log", range, "--pretty=format:%H%x1f%s%x1f%b%x1e"]);

    if (!rawLog) {
        return [];
    }

    return rawLog
        .split("\x1e")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
            const [hash, subject, body = ""] = entry.split("\x1f");

            return {
                hash,
                subject: subject.trim(),
                body: body.trim(),
            };
        });
}

function isMergeCommit(subject) {
    return subject.startsWith("Merge ");
}

function sanitizeSubject(subject) {
    return subject.replace(/\s+\(#\d+\)$/, "").trim();
}

function parseCommitType(subject) {
    const normalizedSubject = sanitizeSubject(subject);
    const conventionalMatch =
        /^(?<type>[a-zA-Z]+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?:\s+(?<description>.+)$/.exec(normalizedSubject);

    if (conventionalMatch?.groups) {
        const type = conventionalMatch.groups.type.toLowerCase();

        return {
            rawType: type,
            type: normalizeType(type),
            scope: conventionalMatch.groups.scope ?? null,
            description: conventionalMatch.groups.description.trim(),
            breaking: Boolean(conventionalMatch.groups.breaking),
            conventional: true,
        };
    }

    const slashMatch = /^(?<type>[a-zA-Z]+)\/(?<description>.+)$/.exec(normalizedSubject);

    if (slashMatch?.groups) {
        const type = slashMatch.groups.type.toLowerCase();

        return {
            rawType: type,
            type: normalizeType(type),
            scope: null,
            description: slashMatch.groups.description.trim(),
            breaking: false,
            conventional: false,
        };
    }

    return {
        rawType: "other",
        type: "other",
        scope: null,
        description: normalizedSubject,
        breaking: false,
        conventional: false,
    };
}

function normalizeType(type) {
    if (type === "feature") {
        return "feat";
    }

    if (type in SECTION_TITLES) {
        return type;
    }

    return "other";
}

function determineBump(parsedCommit, body) {
    if (parsedCommit.breaking || body.includes("BREAKING CHANGE:")) {
        return "major";
    }

    if (parsedCommit.type === "feat") {
        return "minor";
    }

    if (["fix", "refactor", "test", "docs", "build", "chore", "other"].includes(parsedCommit.type)) {
        return "patch";
    }

    return "none";
}

function bumpVersion(version, bump) {
    const [major, minor, patch] = version.split(".").map((part) => Number.parseInt(part, 10));

    if ([major, minor, patch].some(Number.isNaN)) {
        throw new Error(`Invalid version "${version}" in package.json.`);
    }

    if (bump === "major") {
        return `${major + 1}.0.0`;
    }

    if (bump === "minor") {
        return `${major}.${minor + 1}.0`;
    }

    if (bump === "patch") {
        return `${major}.${minor}.${patch + 1}`;
    }

    return version;
}

function buildReleaseData(currentVersion, previousTag, commits) {
    let highestBump = "none";
    const groupedEntries = Object.fromEntries(Object.keys(SECTION_TITLES).map((section) => [section, []]));
    const ignoredCommits = [];

    for (const commit of commits) {
        if (isMergeCommit(commit.subject)) {
            continue;
        }

        const parsedCommit = parseCommitType(commit.subject);

        if (strict && !parsedCommit.conventional) {
            throw new Error(`Commit "${commit.subject}" does not follow Conventional Commits.`);
        }

        const bump = determineBump(parsedCommit, commit.body);

        if (BUMP_PRIORITY[bump] > BUMP_PRIORITY[highestBump]) {
            highestBump = bump;
        }

        if (bump === "none") {
            ignoredCommits.push(commit.subject);
            continue;
        }

        groupedEntries[parsedCommit.type].push({
            hash: commit.hash,
            description: parsedCommit.description,
            scope: parsedCommit.scope,
            conventional: parsedCommit.conventional,
        });
    }

    const nextVersion = highestBump === "none" ? currentVersion : bumpVersion(currentVersion, highestBump);
    const nextTag = `v${nextVersion}`;

    return {
        currentVersion,
        previousTag,
        nextVersion,
        nextTag,
        bump: highestBump,
        hasChanges: highestBump !== "none",
        commitCount: Object.values(groupedEntries).reduce((count, entries) => count + entries.length, 0),
        groupedEntries,
        ignoredCommits,
    };
}

function formatEntry(entry) {
    const scopePrefix = entry.scope ? `**${entry.scope}:** ` : "";
    const conventionalSuffix = entry.conventional ? "" : " _(legacy commit message)_";

    return `- ${scopePrefix}${entry.description}${conventionalSuffix}`;
}

function buildChangelogSection(releaseData, releaseDate) {
    const sections = Object.entries(releaseData.groupedEntries)
        .filter(([, entries]) => entries.length > 0)
        .map(([type, entries]) => {
            const lines = entries.map(formatEntry).join("\n");

            return `### ${SECTION_TITLES[type]}\n\n${lines}`;
        });

    const metadata = [
        `## [${releaseData.nextVersion}] - ${releaseDate}`,
        "",
        `- Release tag: \`${releaseData.nextTag}\``,
        releaseData.previousTag ? `- Previous tag: \`${releaseData.previousTag}\`` : "- Previous tag: initial release",
        `- Version bump: \`${releaseData.bump}\``,
        "",
        ...sections,
    ];

    return metadata.join("\n").trim();
}

function ensureChangelogExists() {
    if (fs.existsSync(changelogPath)) {
        return;
    }

    const initialContent = "# Changelog\n\nAll notable changes to this project will be documented in this file.\n";
    fs.writeFileSync(changelogPath, initialContent, "utf8");
}

function updateChangelog(releaseData, releaseDate) {
    ensureChangelogExists();

    const changelog = fs.readFileSync(changelogPath, "utf8");
    const sectionHeader = `## [${releaseData.nextVersion}] - ${releaseDate}`;

    if (changelog.includes(sectionHeader)) {
        return changelog;
    }

    const section = `${buildChangelogSection(releaseData, releaseDate)}\n`;

    if (!changelog.trim()) {
        return `${section}\n`;
    }

    const lines = changelog.split(/\r?\n/);
    const headerIndex = lines.findIndex((line) => line.startsWith("# "));

    if (headerIndex === -1) {
        return `${section}\n${changelog.trim()}\n`;
    }

    const before = lines.slice(0, headerIndex + 1).join("\n").trimEnd();
    const after = lines.slice(headerIndex + 1).join("\n").trim();

    return `${before}\n\n${section}${after ? `\n\n${after}` : ""}\n`;
}

function updatePackageJson(nextVersion) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    packageJson.version = nextVersion;

    return `${JSON.stringify(packageJson, null, 4)}\n`;
}

function buildReleaseNotes(releaseData) {
    const summaryLines = [
        `# Release ${releaseData.nextTag}`,
        "",
        `- Next version: \`${releaseData.nextVersion}\``,
        `- Version bump: \`${releaseData.bump}\``,
        `- Commits included: ${releaseData.commitCount}`,
        releaseData.previousTag ? `- Previous tag: \`${releaseData.previousTag}\`` : "- Previous tag: initial release",
        "",
        "## Release Summary",
        "",
    ];

    for (const [type, entries] of Object.entries(releaseData.groupedEntries)) {
        if (entries.length === 0) {
            continue;
        }

        summaryLines.push(`### ${SECTION_TITLES[type]}`);
        summaryLines.push("");
        summaryLines.push(...entries.map(formatEntry));
        summaryLines.push("");
    }

    return `${summaryLines.join("\n").trim()}\n`;
}

function writeOutputFile(filePath, content) {
    if (!filePath) {
        return;
    }

    fs.writeFileSync(path.resolve(repoRoot, filePath), content, "utf8");
}

function main() {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const currentVersion = packageJson.version;
    const latestTag = getLatestTag();
    const range = getCommitRange(latestTag);
    const commits = getCommits(range);
    const releaseData = buildReleaseData(currentVersion, latestTag, commits);
    const releaseDate = new Date().toISOString().slice(0, 10);

    if (releaseData.hasChanges && write) {
        fs.writeFileSync(packageJsonPath, updatePackageJson(releaseData.nextVersion), "utf8");
        fs.writeFileSync(changelogPath, updateChangelog(releaseData, releaseDate), "utf8");
    }

    writeOutputFile(manifestPath, `${JSON.stringify(releaseData, null, 4)}\n`);
    writeOutputFile(notesPath, buildReleaseNotes(releaseData));

    process.stdout.write(`${JSON.stringify(releaseData, null, 4)}\n`);
}

try {
    main();
} catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
}
