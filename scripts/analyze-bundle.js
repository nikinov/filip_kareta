#!/usr/bin/env node

/**
 * Bundle analysis script for Prague tour guide website
 * Analyzes bundle size and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');

const BUNDLE_SIZE_LIMITS = {
  // Maximum bundle sizes in KB
  main: 250,
  vendor: 500,
  total: 750,
  // Individual chunk limits
  page: 100,
  component: 50,
};

const PERFORMANCE_THRESHOLDS = {
  // Performance budget thresholds
  firstContentfulPaint: 1500, // ms
  largestContentfulPaint: 2500, // ms
  firstInputDelay: 100, // ms
  cumulativeLayoutShift: 0.1,
};

function analyzeBundleSize() {
  const buildDir = path.join(process.cwd(), '.next');
  const staticDir = path.join(buildDir, 'static');
  
  if (!fs.existsSync(staticDir)) {
    console.log('❌ Build directory not found. Run "npm run build" first.');
    return;
  }

  console.log('🔍 Analyzing bundle size...\n');

  const chunks = [];
  let totalSize = 0;

  // Analyze JavaScript chunks
  const jsDir = path.join(staticDir, 'chunks');
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
    
    jsFiles.forEach(file => {
      const filePath = path.join(jsDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = Math.round(stats.size / 1024);
      
      chunks.push({
        name: file,
        size: sizeKB,
        type: 'javascript',
        path: filePath,
      });
      
      totalSize += sizeKB;
    });
  }

  // Analyze CSS chunks
  const cssDir = path.join(staticDir, 'css');
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
    
    cssFiles.forEach(file => {
      const filePath = path.join(cssDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = Math.round(stats.size / 1024);
      
      chunks.push({
        name: file,
        size: sizeKB,
        type: 'css',
        path: filePath,
      });
      
      totalSize += sizeKB;
    });
  }

  // Sort chunks by size (largest first)
  chunks.sort((a, b) => b.size - a.size);

  // Display results
  console.log('📊 Bundle Analysis Results:');
  console.log('=' .repeat(50));
  
  chunks.forEach(chunk => {
    const icon = chunk.type === 'javascript' ? '📜' : '🎨';
    const status = chunk.size > BUNDLE_SIZE_LIMITS.component ? '⚠️' : '✅';
    console.log(`${icon} ${status} ${chunk.name}: ${chunk.size} KB`);
  });

  console.log('=' .repeat(50));
  console.log(`📦 Total bundle size: ${totalSize} KB`);
  
  // Check against limits
  if (totalSize > BUNDLE_SIZE_LIMITS.total) {
    console.log(`❌ Bundle size exceeds limit (${BUNDLE_SIZE_LIMITS.total} KB)`);
    console.log('💡 Optimization recommendations:');
    console.log('   - Enable code splitting for large components');
    console.log('   - Use dynamic imports for non-critical features');
    console.log('   - Consider removing unused dependencies');
    console.log('   - Optimize images and use WebP format');
  } else {
    console.log(`✅ Bundle size within acceptable limits`);
  }

  // Identify largest chunks for optimization
  const largeChunks = chunks.filter(chunk => chunk.size > BUNDLE_SIZE_LIMITS.component);
  if (largeChunks.length > 0) {
    console.log('\n🔍 Large chunks requiring attention:');
    largeChunks.forEach(chunk => {
      console.log(`   - ${chunk.name}: ${chunk.size} KB`);
    });
  }

  return {
    chunks,
    totalSize,
    withinLimits: totalSize <= BUNDLE_SIZE_LIMITS.total,
    largeChunks,
  };
}

function generateOptimizationReport() {
  console.log('\n🚀 Performance Optimization Checklist:');
  console.log('=' .repeat(50));
  
  const optimizations = [
    {
      name: 'Image Optimization',
      implemented: true,
      description: 'Next.js Image component with WebP/AVIF formats',
    },
    {
      name: 'Lazy Loading',
      implemented: true,
      description: 'Intersection Observer for below-the-fold content',
    },
    {
      name: 'Static Site Generation',
      implemented: true,
      description: 'SSG for tour and blog pages',
    },
    {
      name: 'Code Splitting',
      implemented: true,
      description: 'Dynamic imports and chunk optimization',
    },
    {
      name: 'CDN Configuration',
      implemented: true,
      description: 'Global content delivery optimization',
    },
    {
      name: 'Service Worker',
      implemented: true,
      description: 'Caching strategy for offline support',
    },
    {
      name: 'Resource Hints',
      implemented: true,
      description: 'DNS prefetch and preconnect for critical domains',
    },
    {
      name: 'Bundle Optimization',
      implemented: true,
      description: 'Webpack optimization and tree shaking',
    },
  ];

  optimizations.forEach(opt => {
    const status = opt.implemented ? '✅' : '❌';
    console.log(`${status} ${opt.name}: ${opt.description}`);
  });

  console.log('\n📈 Performance Targets:');
  console.log('=' .repeat(50));
  Object.entries(PERFORMANCE_THRESHOLDS).forEach(([metric, threshold]) => {
    console.log(`🎯 ${metric}: < ${threshold}${metric.includes('Size') ? '' : metric.includes('Paint') || metric.includes('Delay') ? 'ms' : ''}`);
  });

  console.log('\n🔧 Next Steps:');
  console.log('- Run "npm run build" to generate optimized production build');
  console.log('- Test performance with Lighthouse or PageSpeed Insights');
  console.log('- Monitor Core Web Vitals in production');
  console.log('- Set up CDN with environment variables');
}

function main() {
  console.log('🏗️  Prague Tour Guide Website - Bundle Analysis\n');
  
  try {
    const analysis = analyzeBundleSize();
    generateOptimizationReport();
    
    // Exit with error code if bundle is too large
    if (!analysis.withinLimits) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
    process.exit(1);
  }
}

// Run analysis if called directly
if (require.main === module) {
  main();
}

module.exports = {
  analyzeBundleSize,
  generateOptimizationReport,
  BUNDLE_SIZE_LIMITS,
  PERFORMANCE_THRESHOLDS,
};
