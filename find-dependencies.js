const fs = require('fs');
const path = require('path');

function findDependencies(dir) {
    let dependencies = new Set();

    function searchDir(currentDir) {
        const files = fs.readdirSync(currentDir);
        for (const file of files) {
            const filePath = path.join(currentDir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                searchDir(filePath);
            } else if (file.match(/\.(js|jsx|ts|tsx)$/)) {
                const content = fs.readFileSync(filePath, 'utf8');
                const imports = content.match(/from\s+['"]([^'"./][^'"]+)['"]/g) || [];
                const requires = content.match(/require\(['"]([^'"./][^'"]+)['"]\)/g) || [];
                [...imports, ...requires].forEach(match => {
                    const dep = match.match(/['"]([^'"]+)['"]/)[1];
                    dependencies.add(dep);
                });
            }
        }
    }

    searchDir(dir);
    return Array.from(dependencies);
}

const targetDir = process.argv[2] || '.';
const deps = findDependencies(targetDir);

let packageJson = {};
if (fs.existsSync('package.json')) {
    packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
}

packageJson.dependencies = packageJson.dependencies || {};
deps.forEach(dep => {
    if (!packageJson.dependencies[dep]) {
        packageJson.dependencies[dep] = '*';
    }
});

fs.writeFileSync('dependencies.json', JSON.stringify(packageJson, null, 2));

console.log('Dependencies found and added to package.json:');
console.log(deps);