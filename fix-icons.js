const fs = require('fs');
const path = require('path');

// Icon mapping: old name -> new name
const iconMapping = {
  'Euro': 'CurrencyEur',
  'TrendingUp': 'TrendUp', 
  'TrendingDown': 'TrendDown',
  'AlertTriangle': 'Warning',
  'Settings': 'Gear',
  'RefreshCw': 'ArrowsClockwise',
  'History': 'ClockCounterClockwise',
  'AlertCircle': 'WarningCircle',
  'Server': 'Database',
  'Mail': 'Envelope',
  'Search': 'MagnifyingGlass',
  'Send': 'PaperPlaneTilt',
  'Edit': 'PencilSimple',
  'Filter': 'Funnel',
  'BarChart': 'ChartBar',
  'PieChart': 'Chart',
  'DollarSign': 'CurrencyDollar',
  'Save': 'FloppyDisk',
  'RotateCcw': 'ArrowCounterClockwise',
  'Fuel': 'GasPump'
};

function fixIconsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix imports
    for (const [oldIcon, newIcon] of Object.entries(iconMapping)) {
      const importRegex = new RegExp(`\\b${oldIcon}\\b`, 'g');
      if (content.includes(oldIcon)) {
        content = content.replace(importRegex, newIcon);
        modified = true;
        console.log(`Fixed ${oldIcon} -> ${newIcon} in ${filePath}`);
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Process all tsx files in components directory
const componentsDir = path.join(__dirname, 'src', 'components');
const files = fs.readdirSync(componentsDir)
  .filter(file => file.endsWith('.tsx'))
  .map(file => path.join(componentsDir, file));

files.forEach(fixIconsInFile);

// Also fix App.tsx
fixIconsInFile(path.join(__dirname, 'src', 'App.tsx'));

console.log('Icon fixing complete!');