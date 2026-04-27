#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

class GitUpdater {
    constructor() {
        this.repoPath = process.cwd();
    }

    log(message, color = colors.reset) {
        console.log(`${color}${message}${colors.reset}`);
    }

    printHeader(text) {
        this.log('\n' + '='.repeat(60), colors.cyan);
        this.log(`🚀 ${text}`, colors.cyan);
        this.log('='.repeat(60) + '\n', colors.cyan);
    }

    printSuccess(text) {
        this.log(`✅ ${text}`, colors.green);
    }

    printError(text) {
        this.log(`❌ ${text}`, colors.red);
    }

    printInfo(text) {
        this.log(`ℹ️ ${text}`, colors.yellow);
    }

    printWarning(text) {
        this.log(`⚠️ ${text}`, colors.yellow);
    }

    printCommand(text) {
        this.log(`$ ${text}`, colors.blue);
    }

    runCommand(command, check = true, silent = false) {
        try {
            if (!silent) {
                this.printCommand(command);
            }
            const output = execSync(command, {
                encoding: 'utf8',
                stdio: silent ? 'pipe' : 'inherit',
                cwd: this.repoPath
            });
            return { success: true, output };
        } catch (error) {
            if (check) {
                this.printError(`Command failed: ${command}`);
                if (error.stderr) {
                    this.log(error.stderr.toString(), colors.red);
                }
                process.exit(1);
            }
            return { success: false, error: error.message };
        }
    }

    runCommandWithOutput(command, check = true) {
        try {
            this.printCommand(command);
            const output = execSync(command, {
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe'],
                cwd: this.repoPath
            });
            return { success: true, output: output.trim() };
        } catch (error) {
            if (check) {
                this.printError(`Command failed: ${command}`);
                if (error.stderr) {
                    this.log(error.stderr.toString(), colors.red);
                }
                process.exit(1);
            }
            return { success: false, error: error.message, output: error.stdout?.toString() };
        }
    }

    checkGitInstalled() {
        try {
            execSync('git --version', { stdio: 'ignore' });
            return true;
        } catch {
            return false;
        }
    }

    checkGitRepo() {
        const result = this.runCommandWithOutput('git rev-parse --git-dir', false);
        return result.success;
    }

    getCurrentBranch() {
        const result = this.runCommandWithOutput('git branch --show-current', false);
        return result.success ? result.output : null;
    }

    getRemoteUrl() {
        const result = this.runCommandWithOutput('git config --get remote.origin.url', false);
        return result.success ? result.output : null;
    }

    getChangesSummary() {
        const result = this.runCommandWithOutput('git status --porcelain', false);
        if (!result.success || !result.output) {
            return { stats: null, files: [] };
        }

        const files = result.output.split('\n').filter(f => f.trim());
        const stats = {
            modified: 0,
            added: 0,
            deleted: 0,
            renamed: 0,
            untracked: 0
        };

        files.forEach(file => {
            const status = file.substring(0, 2).trim();
            if (status === 'M') stats.modified++;
            else if (status === 'A') stats.added++;
            else if (status === 'D') stats.deleted++;
            else if (status === 'R') stats.renamed++;
            else if (status === '??') stats.untracked++;
        });

        return { stats, files };
    }

    getLastCommitInfo() {
        const result = this.runCommandWithOutput('git log -1 --pretty=format:"%h - %s (%cr)"', false);
        return result.success ? result.output : 'No commits yet';
    }

    getCommitCount() {
        const result = this.runCommandWithOutput('git rev-list --count HEAD', false);
        return result.success ? parseInt(result.output) : 0;
    }

    getRemoteBranches() {
        const result = this.runCommandWithOutput('git branch -r', false);
        if (!result.success) return [];
        
        return result.output.split('\n')
            .map(b => b.trim())
            .filter(b => b && !b.includes('HEAD'))
            .map(b => b.replace('origin/', ''));
    }

    hasUnpushedCommits() {
        const result = this.runCommandWithOutput('git log @{u}..HEAD --oneline', false);
        return result.success && result.output.trim().length > 0;
    }

    addFiles(files = null) {
        if (files && files.length > 0) {
            this.printInfo(`Adding specific files: ${files.join(', ')}`);
            files.forEach(file => {
                this.runCommand(`git add "${file}"`, false);
            });
        } else {
            this.printInfo('Adding all changes...');
            this.runCommand('git add .', false);
        }
        return true;
    }

    commitChanges(message = null) {
        if (!message) {
            // Generate default commit message
            const timestamp = new Date().toLocaleString('en-US', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false 
            }).replace(/(\d+)\/(\d+)\/(\d+),/, '$3-$1-$2');
            
            const { stats } = this.getChangesSummary();
            if (stats && Object.values(stats).some(v => v > 0)) {
                const changes = [];
                if (stats.modified) changes.push(`${stats.modified} modified`);
                if (stats.added) changes.push(`${stats.added} added`);
                if (stats.deleted) changes.push(`${stats.deleted} deleted`);
                if (stats.renamed) changes.push(`${stats.renamed} renamed`);
                if (stats.untracked) changes.push(`${stats.untracked} untracked`);
                message = `Update: ${changes.join(', ')} [${timestamp}]`;
            } else {
                message = `Update ${timestamp}`;
            }
        }

        const result = this.runCommandWithOutput(`git commit -m "${message}"`, false);
        
        if (result.success) {
            this.printSuccess('Changes committed successfully!');
            if (result.output) {
                this.log(result.output, colors.cyan);
            }
        } else {
            if (result.output && result.output.includes('nothing to commit')) {
                this.printWarning('Nothing to commit, working tree clean.');
            } else {
                this.printError('Commit failed!');
                if (result.error) {
                    this.log(result.error, colors.red);
                }
            }
        }
        
        return result.success;
    }

    pushChanges(branch = null, force = false) {
        if (!branch) {
            branch = this.getCurrentBranch() || 'main';
        }

        const remoteUrl = this.getRemoteUrl();
        if (!remoteUrl) {
            this.printError('No remote origin configured!');
            this.printInfo('Add a remote with: git remote add origin <repository-url>');
            return false;
        }

        this.printInfo(`Remote: ${remoteUrl}`);
        this.printInfo(`Branch: ${branch}`);

        // Check if remote branch exists
        const remoteBranches = this.getRemoteBranches();
        const remoteBranchExists = remoteBranches.includes(branch);
        
        if (remoteBranchExists) {
            this.printInfo(`Remote branch '${branch}' exists`);
            
            // Check for unpushed commits
            if (this.hasUnpushedCommits()) {
                this.printInfo('You have unpushed commits');
            }
        } else {
            this.printInfo(`Remote branch '${branch}' will be created`);
        }

        // Check if need to pull first
        if (remoteBranchExists && !force) {
            this.printWarning('Consider pulling latest changes first:');
            this.log(`  git pull origin ${branch}`, colors.cyan);
        }

        let cmd = `git push -u origin ${branch}`;
        if (force) {
            cmd += ' --force';
            this.printWarning('Force push enabled! This will overwrite remote history.');
        }

        const result = this.runCommandWithOutput(cmd, false);
        
        if (result.success) {
            this.printSuccess('Changes pushed successfully!');
            if (result.output) {
                this.log(result.output, colors.cyan);
            }
        } else {
            this.printError('Push failed!');
            if (result.error) {
                this.log(result.error, colors.red);
            }
            
            // Offer help
            this.printInfo('\nTroubleshooting tips:');
            this.log('  1. Check if remote exists: git remote -v', colors.cyan);
            this.log('  2. Pull latest changes: git pull origin main', colors.cyan);
            this.log('  3. Check branch name: git branch', colors.cyan);
            this.log('  4. Force push if needed (caution): git push -f origin main', colors.cyan);
        }

        return result.success;
    }

    showStatus() {
        this.printInfo('Current Status:');
        this.runCommand('git status -s', false, false);

        const branch = this.getCurrentBranch();
        if (branch) {
            this.log(`\n${colors.cyan}On branch: ${branch}${colors.reset}`);
        }

        const remote = this.getRemoteUrl();
        if (remote) {
            this.log(`${colors.cyan}Remote: ${remote}${colors.reset}`);
        }

        const lastCommit = this.getLastCommitInfo();
        this.log(`${colors.cyan}Last commit: ${lastCommit}${colors.reset}`);

        const commitCount = this.getCommitCount();
        if (commitCount > 0) {
            this.log(`${colors.cyan}Total commits: ${commitCount}${colors.reset}`);
        }
    }

    async prompt(question) {
        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                resolve(answer);
            });
        });
    }

    async run(args) {
        this.printHeader('Git Repository Updater');

        // Check git installation
        if (!this.checkGitInstalled()) {
            this.printError('Git is not installed. Please install git first.');
            process.exit(1);
        }

        // Check if git repository
        if (!this.checkGitRepo()) {
            this.printError('Not a git repository! Run \'git init\' first.');
            process.exit(1);
        }

        // Show current status
        this.showStatus();

        // Check for changes
        const { stats, files } = this.getChangesSummary();
        const hasChanges = stats && Object.values(stats).some(v => v > 0);

        if (!hasChanges) {
            this.printWarning('No changes to commit!');
            
            // Check for unpushed commits
            if (this.hasUnpushedCommits()) {
                this.printInfo('You have unpushed commits');
            } else {
                if (!args.force && !args.yes) {
                    const proceed = await this.prompt(`\n${colors.yellow}No changes found. Still proceed with push? (y/N): ${colors.reset}`);
                    if (proceed.toLowerCase() !== 'y') {
                        this.printInfo('Operation cancelled.');
                        return;
                    }
                }
            }
        }

        // Show changes summary
        if (hasChanges) {
            this.log(`\n${colors.cyan}Changes detected:${colors.reset}`);
            for (const [type, count] of Object.entries(stats)) {
                if (count > 0) {
                    this.log(`  • ${type}: ${count} file${count > 1 ? 's' : ''}`);
                }
            }

            if (args.verbose && files.length > 0) {
                this.log(`\n${colors.cyan}Detailed changes:${colors.reset}`);
                files.slice(0, 10).forEach(file => {
                    this.log(`  ${file}`);
                });
                if (files.length > 10) {
                    this.log(`  ... and ${files.length - 10} more`);
                }
            }
        }

        // Confirm action
        if (!args.yes) {
            this.log(`\n${colors.yellow}Ready to update repository${colors.reset}`);
            const proceed = await this.prompt('Proceed with git update? (Y/n): ');
            if (proceed.toLowerCase() === 'n') {
                this.printInfo('Operation cancelled.');
                return;
            }
        }

        console.log();

        // 1. Git add
        if (args.files && args.files.length > 0) {
            this.addFiles(args.files);
        } else {
            this.addFiles();
        }

        // 2. Git commit
        const commitSuccess = this.commitChanges(args.message);

        // 3. Git push
        if (args.push || args.yes) {
            const pushSuccess = this.pushChanges(args.branch, args.force);
            
            if (pushSuccess) {
                const remoteUrl = this.getRemoteUrl();
                if (remoteUrl) {
                    this.log(`\n${colors.cyan}Repository URL: ${remoteUrl}${colors.reset}`);
                }
            }
        } else if (hasChanges && commitSuccess) {
            this.printInfo('Skipping push (use --push to push changes)');
            const branch = args.branch || this.getCurrentBranch() || 'main';
            this.log(`\n${colors.cyan}To push manually:${colors.reset}`);
            this.log(`  git push -u origin ${branch}`, colors.cyan);
        }

        // Final summary
        this.log(`\n${colors.green}${'='.repeat(60)}`);
        this.log('✅ Git update completed!', colors.green);
        this.log(`${'='.repeat(60)}${colors.reset}\n`);

        // Show final status
        this.runCommand('git status -s', false, false);
        
        rl.close();
    }
}

// Parse command line arguments
function parseArgs() {
    const args = {
        message: null,
        branch: null,
        files: [],
        yes: false,
        push: false,
        force: false,
        verbose: false,
        noPush: false
    };

    const argv = process.argv.slice(2);
    
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        
        switch (arg) {
            case '-m':
            case '--message':
                args.message = argv[++i];
                break;
            case '-b':
            case '--branch':
                args.branch = argv[++i];
                break;
            case '-f':
            case '--files':
                while (i + 1 < argv.length && !argv[i + 1].startsWith('-')) {
                    args.files.push(argv[++i]);
                }
                break;
            case '-y':
            case '--yes':
                args.yes = true;
                break;
            case '--push':
                args.push = true;
                break;
            case '--force':
                args.force = true;
                break;
            case '-v':
            case '--verbose':
                args.verbose = true;
                break;
            case '--no-push':
                args.noPush = true;
                break;
            case '-h':
            case '--help':
                showHelp();
                process.exit(0);
                break;
        }
    }

    // Override push if no-push is specified
    if (args.noPush) {
        args.push = false;
    }

    return args;
}

function showHelp() {
    console.log(`
${colors.cyan}Git Repository Updater${colors.reset}
Usage: node scripts/git_update.js [options]

${colors.yellow}Options:${colors.reset}
  -m, --message <msg>     Commit message (default: auto-generated)
  -b, --branch <name>     Branch to push to (default: current branch)
  -f, --files <files>     Specific files to add (space-separated)
  -y, --yes               Automatic yes to all prompts
  --push                  Push after commit
  --force                 Force push (use with caution!)
  -v, --verbose           Show detailed output
  --no-push               Skip push even if configured
  -h, --help              Show this help message

${colors.yellow}Examples:${colors.reset}
  node scripts/git_update.js                    # Interactive mode
  node scripts/git_update.js -y                  # Auto yes to all prompts
  node scripts/git_update.js -m "Bug fix"        # Commit with custom message
  node scripts/git_update.js --push              # Add, commit, and push
  node scripts/git_update.js -f app.js           # Add specific file only
  node scripts/git_update.js -b develop --push   # Push to different branch
  node scripts/git_update.js --force --push      # Force push (use with caution)
    `, colors.reset);
}

// Main execution
async function main() {
    const args = parseArgs();
    const updater = new GitUpdater();
    
    try {
        await updater.run(args);
    } catch (error) {
        updater.printError(`Unexpected error: ${error.message}`);
        process.exit(1);
    }
}

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log(`\n\n${colors.yellow}⚠️ Operation cancelled by user${colors.reset}`);
    rl.close();
    process.exit(0);
});

// Run the script
if (require.main === module) {
    main();
}

module.exports = { GitUpdater };