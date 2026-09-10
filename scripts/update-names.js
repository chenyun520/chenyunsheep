const fs = require('fs');
const path = require('path');

// 需要替换的文本对
const replacements = [
  {
    from: 'Chenyun',
    to: 'Chenyun'
  },
  {
    from: 'Chenyun',
    to: 'Chenyun'
  },
  {
    from: 'chenyun',
    to: 'chenyun'
  },
  {
    from: 'ChenyunCastle',
    to: 'chenyun-engineer'
  },
  {
    from: 'chenyuncastle',
    to: 'chenyun-engineer'
  },
  {
    from: 'https://chenyun.so',
    to: 'https://chenyun.so'
  },
  {
    from: 'https://github.com/ChenyunCastle',
    to: 'https://github.com/chenyun-engineer'
  },
  {
    from: 'https://x.com/chenyun_engineer',
    to: 'https://x.com/chenyun_engineer'
  },
  {
    from: 'https://youtube.com/@chenyuncastle',
    to: 'https://youtube.com/@chenyun_engineer'
  },
  {
    from: 'https://t.me/chenyun_so',
    to: 'https://t.me/chenyun_engineer'
  },
  {
    from: 'https://www.linkedin.com/in/chenyuncastle/',
    to: 'https://www.linkedin.com/in/chenyun-engineer'
  },
  {
    from: 'chenyun_engineer',
    to: 'chenyun_engineer'
  }
];

// 需要处理的文件扩展名
const extensions = ['.md', '.tsx', '.ts', '.js', '.mjs', '.json', '.css'];

// 递归处理目录
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
      processDirectory(fullPath);
    } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
      processFile(fullPath);
    }
  }
}

// 处理单个文件
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // 执行所有替换
  for (const replacement of replacements) {
    newContent = newContent.replace(
      new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      replacement.to
    );
  }

  // 如果内容有变化，写回文件
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

// 从当前目录开始处理
processDirectory('.');

console.log('All files have been updated!');