const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = process.cwd(); // Current working directory
const outputFile = 'tree.txt';
const excludeDirs = ['node_modules', '.git', 'dist', 'build', 'coverage'];
const excludeFiles = ['.DS_Store', 'tree.txt', 'package-lock.json'];
const maxDepth = Infinity; // Set to a number to limit depth

// File extensions to count lines for
const textExtensions = new Set([
    '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss', '.json',
    '.md', '.txt', '.py', '.rb', '.php', '.java', '.c', '.cpp', '.h',
    '.go', '.rs', '.swift', '.kt', '.sh', '.bat', '.yml', '.yaml',
    '.xml', '.vue', '.svelte', '.graphql', '.sql'
]);

async function countLines(filePath) {
    try {
        const ext = path.extname(filePath).toLowerCase();
        if (!textExtensions.has(ext)) return null;
        
        const content = await fs.promises.readFile(filePath, 'utf8');
        const lines = content.split('\n').length;
        return lines;
    } catch (error) {
        return null; // Binary file or read error
    }
}

async function generateTree(dirPath, depth = 0, prefix = '') {
    if (depth > maxDepth) return '';
    
    let treeString = '';
    const items = await fs.promises.readdir(dirPath);
    
    // Filter and sort items
    const filteredItems = items.filter(item => {
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
            return !excludeDirs.includes(item);
        } else {
            return !excludeFiles.includes(item);
        }
    }).sort((a, b) => {
        const aPath = path.join(dirPath, a);
        const bPath = path.join(dirPath, b);
        const aIsDir = fs.statSync(aPath).isDirectory();
        const bIsDir = fs.statSync(bPath).isDirectory();
        
        // Directories first, then files
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.localeCompare(b);
    });
    
    for (let i = 0; i < filteredItems.length; i++) {
        const item = filteredItems[i];
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);
        const isLast = i === filteredItems.length - 1;
        
        // Determine tree symbols
        const line = isLast ? '└── ' : '├── ';
        const childPrefix = isLast ? '    ' : '│   ';
        
        if (stats.isDirectory()) {
            // Directory
            treeString += `${prefix}${line}📁 ${item}/\n`;
            treeString += await generateTree(fullPath, depth + 1, prefix + childPrefix);
        } else {
            // File with extension and line count
            const ext = path.extname(item) || '(no extension)';
            const lines = await countLines(fullPath);
            
            if (lines !== null) {
                treeString += `${prefix}${line}📄 ${item} [${ext}] (${lines} lines)\n`;
            } else {
                treeString += `${prefix}${line}📄 ${item} [${ext}]\n`;
            }
        }
    }
    
    return treeString;
}

async function generateStats(dirPath) {
    let totalFiles = 0;
    let totalDirs = 0;
    let totalLines = 0;
    const extensionStats = {};
    
    async function walk(dir) {
        const items = await fs.promises.readdir(dir);
        
        for (const item of items) {
            if (excludeDirs.includes(item) || excludeFiles.includes(item)) continue;
            
            const fullPath = path.join(dir, item);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
                totalDirs++;
                await walk(fullPath);
            } else {
                totalFiles++;
                const ext = path.extname(item).toLowerCase() || 'no extension';
                extensionStats[ext] = (extensionStats[ext] || 0) + 1;
                
                const lines = await countLines(fullPath);
                if (lines) {
                    totalLines += lines;
                }
            }
        }
    }
    
    await walk(dirPath);
    
    return {
        totalFiles,
        totalDirs,
        totalLines,
        extensionStats
    };
}

async function main() {
    console.log('Generating file tree...');
    
    try {
        // Generate tree structure
        const rootName = path.basename(rootDir);
        let treeContent = `📁 ${rootName}/\n`;
        treeContent += await generateTree(rootDir);
        
        // Generate statistics
        const stats = await generateStats(rootDir);
        
        // Add summary
        treeContent += '\n📊 SUMMARY\n';
        treeContent += '===========\n';
        treeContent += `Total Directories: ${stats.totalDirs}\n`;
        treeContent += `Total Files: ${stats.totalFiles}\n`;
        treeContent += `Total Lines of Code: ${stats.totalLines}\n`;
        treeContent += '\n📈 FILE EXTENSIONS\n';
        treeContent += '==================\n';
        
        Object.entries(stats.extensionStats)
            .sort((a, b) => b[1] - a[1])
            .forEach(([ext, count]) => {
                treeContent += `${ext}: ${count} file${count > 1 ? 's' : ''}\n`;
            });
        
        treeContent += `\nGenerated: ${new Date().toLocaleString()}`;
        
        // Write to file
        await fs.promises.writeFile(outputFile, treeContent);
        
        console.log(`✅ Tree generated successfully in ${outputFile}`);
        console.log(`📊 Found ${stats.totalFiles} files in ${stats.totalDirs} directories`);
        console.log(`📝 Total lines of code: ${stats.totalLines}`);
        
    } catch (error) {
        console.error('❌ Error generating tree:', error.message);
    }
}

// Run the script
main();