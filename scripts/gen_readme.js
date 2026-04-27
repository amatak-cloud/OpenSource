#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { existsSync } = require('fs');

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

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

async function promptUser(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function readPackageJson() {
    try {
        const packagePath = path.join(process.cwd(), 'package.json');
        if (!existsSync(packagePath)) {
            log('⚠️  No package.json found', colors.yellow);
            return null;
        }
        
        const content = await fs.readFile(packagePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        log(`❌ Error reading package.json: ${error.message}`, colors.red);
        return null;
    }
}

async function readTreeFile() {
    try {
        const treePath = path.join(process.cwd(), 'tree.txt');
        if (!existsSync(treePath)) {
            log('⚠️  No tree.txt found. Run scripts/gen_tree.js first.', colors.yellow);
            return null;
        }
        
        const content = await fs.readFile(treePath, 'utf8');
        return content;
    } catch (error) {
        log(`❌ Error reading tree.txt: ${error.message}`, colors.red);
        return null;
    }
}

async function getGitInfo() {
    try {
        const { execSync } = require('child_process');
        const origin = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
        
        // Extract repo name from git URL
        let repoName = '';
        if (origin.includes('github.com')) {
            const match = origin.match(/github\.com[:/](.+)\.git$/);
            if (match) {
                repoName = match[1];
            }
        }
        
        return { origin, repoName };
    } catch (error) {
        return { origin: '', repoName: '' };
    }
}

function generateBadges(packageJson) {
    const badges = [];
    
    if (packageJson) {
        // Version badge
        if (packageJson.version) {
            badges.push(`![version](https://img.shields.io/badge/version-${packageJson.version}-blue.svg)`);
        }
        
        // License badge
        if (packageJson.license) {
            badges.push(`![license](https://img.shields.io/badge/license-${packageJson.license}-green.svg)`);
        }
        
        // Node version badge
        if (packageJson.engines && packageJson.engines.node) {
            badges.push(`![node](https://img.shields.io/badge/node-${packageJson.engines.node}-brightgreen.svg)`);
        }
    }
    
    // Add build badge placeholder
    badges.push(`![build](https://img.shields.io/badge/build-passing-brightgreen.svg)`);
    
    return badges.join(' ');
}

function generateInstallationCommands(packageJson) {
    if (!packageJson) {
        return '```bash\nnpm install\n```';
    }
    
    const hasYarn = packageJson.packageManager?.includes('yarn') || false;
    
    if (hasYarn) {
        return '```bash\n# Using yarn\nyarn install\n\n# Using npm\nnpm install\n```';
    } else {
        return '```bash\nnpm install\n```';
    }
}

function generateScriptsSection(packageJson) {
    if (!packageJson || !packageJson.scripts) {
        return 'No scripts defined.';
    }
    
    let scripts = '| Script | Description |\n';
    scripts += '|--------|-------------|\n';
    
    const scriptDescriptions = {
        'start': 'Start the application',
        'dev': 'Run in development mode',
        'build': 'Build for production',
        'test': 'Run tests',
        'lint': 'Lint code',
        'format': 'Format code',
        'preview': 'Preview build',
        'serve': 'Serve application'
    };
    
    Object.entries(packageJson.scripts).forEach(([name, command]) => {
        const description = scriptDescriptions[name] || 'Custom script';
        scripts += `| \`${name}\` | ${description} |\n`;
    });
    
    return scripts;
}

function generateDependenciesTable(dependencies, type = 'dependencies') {
    if (!dependencies || Object.keys(dependencies).length === 0) {
        return `No ${type} installed.`;
    }
    
    let table = `| Package | Version | Description |\n`;
    table += `|---------|---------|-------------|\n`;
    
    Object.entries(dependencies).forEach(([name, version]) => {
        // Clean version string
        version = version.replace('^', '').replace('~', '');
        
        // Add placeholder descriptions (in real scenario, you might want to fetch from npm)
        const description = getPackageDescription(name) || '—';
        
        table += `| ${name} | ${version} | ${description} |\n`;
    });
    
    return table;
}

// Simple package descriptions (you could enhance this by fetching from npm registry)
function getPackageDescription(pkgName) {
    const descriptions = {
        'express': 'Fast, unopinionated, minimalist web framework',
        'react': 'A JavaScript library for building user interfaces',
        'vue': 'The Progressive JavaScript Framework',
        'typescript': 'TypeScript is a superset of JavaScript',
        'webpack': 'Module bundler',
        'babel': 'JavaScript compiler',
        'jest': 'Delightful JavaScript Testing',
        'mocha': 'Simple, flexible, fun test framework',
        'eslint': 'Find and fix problems in your JavaScript code',
        'prettier': 'Opinionated code formatter',
        'axios': 'Promise based HTTP client',
        'lodash': 'Utility library',
        'moment': 'Parse, validate, manipulate dates',
        'dotenv': 'Loads environment variables',
        'cors': 'CORS middleware',
        'helmet': 'Secure Express apps',
        'mongoose': 'MongoDB ODM',
        'sequelize': 'Promise-based ORM',
        'passport': 'Authentication middleware',
        'jsonwebtoken': 'JSON Web Token implementation'
    };
    
    return descriptions[pkgName] || null;
}

function parseTreeStats(treeContent) {
    if (!treeContent) return null;
    
    const stats = {
        totalFiles: 0,
        totalDirs: 0,
        totalLines: 0,
        extensions: []
    };
    
    // Parse summary section
    const summaryMatch = treeContent.match(/Total Files: (\d+).*?Total Directories: (\d+).*?Total Lines of Code: (\d+)/s);
    if (summaryMatch) {
        stats.totalFiles = parseInt(summaryMatch[1]);
        stats.totalDirs = parseInt(summaryMatch[2]);
        stats.totalLines = parseInt(summaryMatch[3]);
    }
    
    // Parse extensions
    const extensionSection = treeContent.split('📈 FILE EXTENSIONS')[1]?.split('==================')[1]?.split('\n\n')[0];
    if (extensionSection) {
        const extLines = extensionSection.split('\n').filter(line => line.trim() && !line.includes('Generated:'));
        stats.extensions = extLines.map(line => line.trim());
    }
    
    return stats;
}

function extractTreeStructure(treeContent) {
    if (!treeContent) return '';
    
    // Remove summary section and keep only the tree structure
    const lines = treeContent.split('\n');
    const treeLines = [];
    let inSummary = false;
    
    for (const line of lines) {
        if (line.includes('📊 SUMMARY')) {
            break;
        }
        if (line.trim() && !line.includes('Generated:')) {
            treeLines.push(line);
        }
    }
    
    return treeLines.join('\n');
}

async function generateReadme() {
    log('\n📄 README.md Generator', colors.blue);
    log('======================\n', colors.blue);
    
    // Read package.json
    const packageJson = await readPackageJson();
    
    // Read tree.txt
    const treeContent = await readTreeFile();
    const treeStats = parseTreeStats(treeContent);
    const treeStructure = extractTreeStructure(treeContent);
    
    // Get git info
    const gitInfo = await getGitInfo();
    
    // Get project name
    let projectName = packageJson?.name || path.basename(process.cwd());
    
    log(`📦 Project: ${projectName}`, colors.cyan);
    
    // Get user input for sections
    log('\n📝 Configure README sections:', colors.yellow);
    
    const includeDescription = await promptUser('Include description section? (Y/n): ');
    const includeInstallation = await promptUser('Include installation section? (Y/n): ');
    const includeUsage = await promptUser('Include usage section? (Y/n): ');
    const includeScripts = await promptUser('Include scripts section? (Y/n): ');
    const includeDependencies = await promptUser('Include dependencies section? (Y/n): ');
    const includeTree = await promptUser('Include project tree? (Y/n): ');
    const includeLicense = await promptUser('Include license section? (Y/n): ');
    
    // Get project description
    let projectDescription = '';
    if (includeDescription.toLowerCase() !== 'n') {
        projectDescription = await promptUser('\n📝 Enter project description: ');
    }
    
    // Generate README content
    let readme = `# ${projectName}\n\n`;
    
    // Add badges
    const badges = generateBadges(packageJson);
    if (badges) {
        readme += `${badges}\n\n`;
    }
    
    // Description
    if (includeDescription.toLowerCase() !== 'n' && projectDescription) {
        readme += `## 📖 Description\n\n${projectDescription}\n\n`;
    }
    
    // Table of Contents
    readme += `## 📑 Table of Contents\n\n`;
    if (includeInstallation.toLowerCase() !== 'n') readme += `- [Installation](#installation)\n`;
    if (includeUsage.toLowerCase() !== 'n') readme += `- [Usage](#usage)\n`;
    if (includeScripts.toLowerCase() !== 'n') readme += `- [Scripts](#scripts)\n`;
    if (includeDependencies.toLowerCase() !== 'n') readme += `- [Dependencies](#dependencies)\n`;
    if (includeTree.toLowerCase() !== 'n') readme += `- [Project Structure](#project-structure)\n`;
    readme += `- [Contributing](#contributing)\n`;
    if (includeLicense.toLowerCase() !== 'n') readme += `- [License](#license)\n`;
    readme += `\n`;
    
    // Installation
    if (includeInstallation.toLowerCase() !== 'n') {
        readme += `## 🚀 Installation\n\n`;
        readme += `### Prerequisites\n\n`;
        readme += `- Node.js ${packageJson?.engines?.node || '14.x or higher'}\n`;
        readme += `- npm or yarn\n\n`;
        readme += `### Steps\n\n`;
        readme += `1. Clone the repository\n`;
        readme += `   \`\`\`bash\n`;
        if (gitInfo.origin) {
            readme += `   git clone ${gitInfo.origin}\n`;
        } else {
            readme += `   git clone https://github.com/amatak-cloud/${projectName}.git\n`;
        }
        readme += `   cd ${projectName}\n`;
        readme += `   \`\`\`\n\n`;
        readme += `2. Install dependencies\n`;
        readme += `   ${generateInstallationCommands(packageJson)}\n\n`;
    }
    
    // Usage
    if (includeUsage.toLowerCase() !== 'n') {
        readme += `## 💻 Usage\n\n`;
        readme += `### Development\n\n`;
        readme += `\`\`\`bash\n`;
        readme += `npm run dev\n`;
        readme += `\`\`\`\n\n`;
        readme += `### Production\n\n`;
        readme += `\`\`\`bash\n`;
        readme += `npm start\n`;
        readme += `\`\`\`\n\n`;
    }
    
    // Scripts
    if (includeScripts.toLowerCase() !== 'n' && packageJson?.scripts) {
        readme += `## 📜 Scripts\n\n`;
        readme += generateScriptsSection(packageJson);
        readme += `\n\n`;
    }
    
    // Dependencies
    if (includeDependencies.toLowerCase() !== 'n') {
        if (packageJson?.dependencies && Object.keys(packageJson.dependencies).length > 0) {
            readme += `## 📦 Dependencies\n\n`;
            readme += `### Production Dependencies\n\n`;
            readme += generateDependenciesTable(packageJson.dependencies, 'production');
            readme += `\n\n`;
        }
        
        if (packageJson?.devDependencies && Object.keys(packageJson.devDependencies).length > 0) {
            readme += `### Development Dependencies\n\n`;
            readme += generateDependenciesTable(packageJson.devDependencies, 'development');
            readme += `\n\n`;
        }
    }
    
    // Project Structure (from tree.txt)
    if (includeTree.toLowerCase() !== 'n' && treeStructure) {
        readme += `## 📁 Project Structure\n\n`;
        readme += `\`\`\`\n`;
        readme += treeStructure;
        readme += `\`\`\`\n\n`;
        
        // Add stats if available
        if (treeStats) {
            readme += `### 📊 Statistics\n\n`;
            readme += `- **Total Files:** ${treeStats.totalFiles}\n`;
            readme += `- **Total Directories:** ${treeStats.totalDirs}\n`;
            readme += `- **Total Lines of Code:** ${treeStats.totalLines}\n\n`;
            
            if (treeStats.extensions.length > 0) {
                readme += `### 🔧 File Extensions\n\n`;
                treeStats.extensions.forEach(ext => {
                    readme += `- ${ext}\n`;
                });
                readme += `\n`;
            }
        }
    }
    
    // Contributing
    readme += `## 🤝 Contributing\n\n`;
    readme += `Contributions, issues, and feature requests are welcome!\n\n`;
    readme += `1. Fork the project\n`;
    readme += `2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)\n`;
    readme += `3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)\n`;
    readme += `4. Push to the branch (\`git push origin feature/amazing-feature\`)\n`;
    readme += `5. Open a Pull Request\n\n`;
    
    // License
    if (includeLicense.toLowerCase() !== 'n') {
        const license = packageJson?.license || 'MIT';
        readme += `## 📄 License\n\n`;
        readme += `This project is ${license} licensed.\n\n`;
    }
    
    // Footer
    readme += `---\n`;
    readme += `*README generated with [amatak-cloud/scripts](https://github.com/amatak-cloud/scripts)*\n`;
    
    return readme;
}

async function main() {
    try {
        // Check if tree.txt exists
        const treeExists = existsSync(path.join(process.cwd(), 'tree.txt'));
        if (!treeExists) {
            log('\n⚠️  tree.txt not found!', colors.yellow);
            log('Run scripts/gen_tree.js first to generate project tree.', colors.cyan);
            const answer = await promptUser('Continue without tree.txt? (y/N): ');
            if (answer.toLowerCase() !== 'y') {
                log('❌ Operation cancelled', colors.red);
                rl.close();
                return;
            }
        }
        
        // Generate README
        const readmeContent = await generateReadme();
        
        // Write README.md
        const readmePath = path.join(process.cwd(), 'README.md');
        await fs.writeFile(readmePath, readmeContent);
        
        log('\n✅ README.md generated successfully!', colors.green);
        log(`📄 Location: ${readmePath}`, colors.cyan);
        
        // Preview
        log('\n📋 Preview:', colors.blue);
        log('==========', colors.blue);
        console.log(readmeContent.substring(0, 500) + '...\n');
        
        rl.close();
        
    } catch (error) {
        log(`\n❌ Error generating README: ${error.message}`, colors.red);
        rl.close();
        process.exit(1);
    }
}

// Handle Ctrl+C
process.on('SIGINT', () => {
    log('\n\n❌ Operation cancelled by user', colors.red);
    rl.close();
    process.exit(0);
});

// Run the script
if (require.main === module) {
    main().catch(error => {
        log(`\n❌ Unexpected error: ${error.message}`, colors.red);
        rl.close();
        process.exit(1);
    });
}

module.exports = { main };