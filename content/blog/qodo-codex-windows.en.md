Installing a coding tool is one step. Proving that it can review a real repository is another.

Qodo is an AI code review and code quality platform; Codex is OpenAI’s coding agent. The Qodo plugin lets Codex call Qodo’s setup, codebase, and review workflows.

The gap between installing and proving became clear while setting up Qodo with Codex on Windows. Qodo CLI 2.1.0 was available, authentication succeeded, and the tools were discoverable. A subsequent local review failed because Qodo could not obtain repository credentials. The setup was therefore partially verified; there was no completed review to evaluate.

**Test context:** Windows 11, Codex with Qodo plugin 2.1.6, and Qodo CLI 2.1.0, on November 3, 2026.

This guide combines that observed result with the official setup procedure. It explains what each check establishes, how to investigate command discovery on Windows, and where to stop when a repository access error prevents a review.

## 1. Understand the separate components

The **Qodo plugin** supplies workflows such as setup, codebase understanding, and review. The **Qodo CLI** runs the local integration. **Authentication** identifies the Qodo account; repository access determines whether the service can reach the project being reviewed. Installing one component does not establish that the others work. [Qodo’s Codex integration](https://docs.qodo.ai/agentic-toolbox/codex-plugin)

Keep five checkpoints separate:

**Plugin installed → CLI available → Account verified → Relevant tools discoverable → Review completed**

This article follows the Windows CLI path. Qodo also supports an MCP connection, which has its own authentication and verification flow. [Official setup skill](https://github.com/qodo-ai/qodo-skills/blob/main/codex-packages/qodo/skills/qodo-setup/SKILL.md)

## 2. Install the plugin and check prerequisites

In the desktop app, open Codex, select **Plugins**, search for **Qodo**, and install it. In Codex CLI, `/plugins` opens the plugin browser. Start a new chat or CLI session afterward so the bundled skills can load. Plugins are not available in the Codex IDE extension; install them from the desktop app or Codex CLI. [OpenAI plugin documentation](https://learn.chatgpt.com/docs/plugins)

You will also need PowerShell, a Qodo account, and a Git repository for the review stage. Check Node.js:

```powershell
node --version
```

The Qodo CLI documentation lists Node.js 20 or later; the more specific setup reference requires **20.6.0 or later**. Follow the stricter requirement. The setup skill currently requires Qodo CLI 2.0.0 or newer before authentication. These are compatibility requirements, not claims about the latest releases. [CLI installation](https://docs.qodo.ai/agentic-toolbox/cli), [runtime reference](https://github.com/qodo-ai/qodo-skills/blob/main/codex-packages/qodo/skills/qodo-setup/references/runtime.md)

## 3. Install a verified runtime

If you prefer guided setup, ask Codex to use `$qodo-setup` and follow the installed skill’s current checks. The manual procedure below makes the installer verification explicit.

The public CLI page provides a PowerShell download-and-execute command. The current setup skill instead specifies a pinned installer, checksum verification, and inspection before execution. The example below follows that procedure for **Qodo Cloud**. Organization-hosted deployments must use their own supplied installer URL, checksum, and login endpoint. [Official runtime installation procedure](https://github.com/qodo-ai/qodo-skills/blob/main/codex-packages/qodo/skills/qodo-setup/references/runtime.md)

The following pin was published in the official setup reference checked on November 3, 2026. If the reference lists a different pin when you install, use its current value instead of copying this one:

```powershell
$qodoHash = 'b0386d363d07e62384d099ddf41347f48cc1e80ed842c2916fb181c9356ed96e'
$qodoUrl = "https://get.qodo.ai/installers/$qodoHash/install.ps1"
$qodoTemp = Join-Path $env:TEMP ("qodo-setup-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $qodoTemp -ErrorAction Stop | Out-Null
$qodoInstaller = Join-Path $qodoTemp 'install.ps1'

Invoke-WebRequest -Uri $qodoUrl -OutFile $qodoInstaller -ErrorAction Stop
$qodoActualHash = (Get-FileHash -LiteralPath $qodoInstaller -Algorithm SHA256).Hash
if ($qodoActualHash -ne $qodoHash) {
    throw 'Installer checksum mismatch. Stop without running it.'
}

notepad.exe $qodoInstaller
```

After reviewing that file, check the effective execution policy:

```powershell
Get-ExecutionPolicy -List
```

When every scope is `Undefined`, Windows PowerShell applies `Restricted` on Windows client editions, which does not run script files. Qodo’s public one-line command passes `-ExecutionPolicy Bypass` to that single process; the setup skill instead says to honor execution-policy restrictions and stop if execution is denied. [Microsoft: execution policies](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-5.1)

When the policy permits it, run the same saved script:

```powershell
powershell.exe -NoProfile -File $qodoInstaller
```

If policy blocks execution, change it only through an approved process, such as your organization’s process on a managed device. Do not substitute a different download or skip a failed checksum check. This is documented installation guidance, not a record of rerunning this exact recipe.

## 4. Diagnose “qodo is not recognized”

During the original setup, PowerShell could not resolve `qodo` after installation. A process inherits its environment from its parent, so an already running terminal or desktop app can retain an older `PATH`. Reopening the terminal—and, if necessary, its parent application—can refresh that environment. [Microsoft: environment variables](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables?view=powershell-7.5)

For the default native installation, inspect the path and test the executable directly:

```powershell
$qodoExe = Join-Path $env:USERPROFILE '.qodo\bin\qodo.exe'
Test-Path -LiteralPath $qodoExe
& $qodoExe --version
```

Use this example only after confirming that the file belongs to the expected installation. If `QODO_HOME` was explicitly configured, inspect that installation instead. If the native executable is absent, consult the runtime reference for the supported Node-based entry point.

If the direct invocation works while `qodo --version` fails, command discovery is the immediate issue. It does not establish authentication or review access. Keep using the verified executable for subsequent checks; a persistent `PATH` edit is unnecessary for this workflow.

## 5. Verify identity, then tool discovery

For the verified native installation above, run these checks in order:

```powershell
& $qodoExe --version
& $qodoExe read whoami --json
& $qodoExe tools --refresh --json
```

Run the catalog command only after the identity check succeeds. Inspect the returned catalog for the capability needed by the task. The installed skill may add version, distribution, and host metadata to these commands; those values should come from that skill. A failed catalog refresh after successful authentication is a tool-access problem to report, not an automatic reason to log in again. [Official setup checks](https://github.com/qodo-ai/qodo-skills/blob/main/codex-packages/qodo/skills/qodo-setup/SKILL.md)

If the identity result explicitly says you are signed out of Qodo Cloud, use `& $qodoExe login`, finish the browser flow, then repeat the identity check. Preserve the organization’s login endpoint for other deployments.

You can ask Codex to perform the verification:

```text
Use $qodo-setup to check the Qodo runtime, account identity,
and relevant tool availability.
Do not change project files.
Report each verified stage and preserve any exact error.
Do not describe tool discovery as a completed review.
```

To remove the integration later, `& $qodoExe uninstall` removes the CLI, global Qodo skills, stored credentials, and configuration, according to the CLI’s own help.

## 6. Prepare a real review

Qodo’s Reviewer sends the working-tree diff, new untracked files, and supplied session context to its review service. Local edits can remain uncommitted and unpushed, but the comparison base must be pushed: the review engine clones it from your Git provider. Review therefore requires Qodo to have access to that repository. Check which code and context may be shared before submitting customer or company work. Reviewer is in Beta at the time of writing. [Reviewer documentation](https://docs.qodo.ai/agentic-toolbox/agentic-toolbox-codebase-review-skill)

Use the intended target branch and its merge-base with `HEAD` as the comparison baseline, and include the change’s purpose and known constraints. In PowerShell, with `origin/main` as the target:

```powershell
git fetch origin
$reviewBase = git merge-base HEAD origin/main
if ($LASTEXITCODE -ne 0 -or -not $reviewBase) {
    throw 'Cannot resolve the merge base. Fetch the missing history or choose the correct target branch.'
}
& $qodoExe review --base $reviewBase
```

Replace `origin/main` when the change targets another branch. Check the available options with `& $qodoExe review --help`; the review skill also attaches session context through `--context-file`. [Official review workflow](https://github.com/qodo-ai/qodo-skills/blob/main/codex-packages/qodo/skills/qodo-review/SKILL.md)

For an authorized review, a focused Codex prompt is:

```text
Use $qodo-review to review the current local changes.
Resolve the correct remote comparison base and include the
change's purpose, decisions, and completed checks as context.
Focus on correctness, security, regressions, and edge cases.
Do not edit files, commit, push, or deploy.
If access fails, report the exact error and stop.
```

## 7. Record the actual result

The observed local review did **not** complete. It returned:

```text
Qodo could not obtain repository credentials for the current workspace. Check the active workspace and repository connection; if those are correct, contact support before starting another review. Do not automatically start another attempt.
```

That message identifies the failed stage, but does not establish the underlying cause. Because the review engine clones the comparison base from the Git provider, start with the repository connection: confirm that the active Qodo workspace is the intended one and that Qodo is installed in the Git provider with access to this repository. If those are correct, contact support. This result does not justify repeated login attempts or an automatic review retry. [Install Qodo in your Git provider](https://docs.qodo.ai/install-qodo/install)

| Check | Observed result | What it establishes |
|---|---|---|
| CLI version | 2.1.0 | The installed runtime could be invoked |
| Account authentication | Succeeded | The account was authenticated |
| Tool discovery | Succeeded | Tools were discoverable in that context |
| Local review | Failed: repository credentials | No completed review result was available |

There is consequently no evidence here for a clean review, the number of issues Qodo would find, or a quality comparison with Codex.

## 8. Use the failure stage to guide troubleshooting

| Symptom | Next useful check |
|---|---|
| Command not recognized | Verify the installation path and direct executable invocation |
| Plugin installed, skills missing | Start a new Codex chat/session and confirm the plugin is enabled |
| Identity succeeds, catalog fails | Preserve the catalog error and check capability/access |
| Repository credentials unavailable | Check the active workspace and that Qodo is installed in the Git provider with access to the repository; follow the returned stop instruction |
| `closed_preview` or another explicit access gate | Follow the reported access requirement; do not retry an unchanged entitlement failure |

The last row describes a possible error handled by the review skill; it was **not** the observed failure in this setup. [Review error handling](https://github.com/qodo-ai/qodo-skills/blob/main/codex-packages/qodo/skills/qodo-review/SKILL.md)

For me, the practical lesson is to attach evidence to each stage. A successful login is useful, but it cannot stand in for a completed repository review. AI review can add another perspective to development; I still treat tests, integration checks, and human judgment as separate responsibilities.

*This is an independent technical guide based on official documentation and the setup evidence described above. It is not documentation issued by Qodo.*

## Official references

- [Qodo: installation with Codex](https://docs.qodo.ai/agentic-toolbox/codex-plugin)
- [Qodo: Agentic Toolbox CLI installation](https://docs.qodo.ai/agentic-toolbox/cli)
- [Qodo: setup skill source](https://github.com/qodo-ai/qodo-skills/blob/main/codex-packages/qodo/skills/qodo-setup/SKILL.md)
- [Qodo: runtime and verified installer procedure](https://github.com/qodo-ai/qodo-skills/blob/main/codex-packages/qodo/skills/qodo-setup/references/runtime.md)
- [Qodo: Reviewer documentation](https://docs.qodo.ai/agentic-toolbox/agentic-toolbox-codebase-review-skill)
- [Qodo: review skill source](https://github.com/qodo-ai/qodo-skills/blob/main/codex-packages/qodo/skills/qodo-review/SKILL.md)
- [Qodo: install Qodo in your Git provider](https://docs.qodo.ai/install-qodo/install)
- [OpenAI: plugins in ChatGPT and Codex](https://learn.chatgpt.com/docs/plugins)
- [Microsoft: PowerShell environment variables](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables?view=powershell-7.5)
- [Microsoft: PowerShell execution policies](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-5.1)
