# Design Document

## Overview

This design addresses the packaging and production readiness of the halloween-phantom-pet VSCode extension. The extension is a fully-featured TypeScript-based extension with webview UI, commands, and configuration - not just a theme. The packaging process must compile TypeScript source, bundle webview assets, include sprite resources, and produce a clean .vsix file that passes vsce validation.

The design focuses on:
1. Fixing the TypeScript compilation pipeline to ensure proper output structure
2. Properly bundling webview assets (HTML, CSS, JS) into the output directory
3. Configuring .vscodeignore to exclude source files while including compiled output and resources
4. Ensuring package.json has correct metadata, scripts, and dependency declarations
5. Validating the package can be successfully created and installed

## Architecture

### Build Pipeline Architecture

```
Source Files (src/)
    ├── TypeScript files (*.ts)
    └── Webview assets (src/webview/)
         ├── petView.html
         ├── petView.css
         └── petView.js
         
         ↓ [TypeScript Compiler]
         
Compiled Output (out/)
    ├── extension.js (main entry)
    ├── Other compiled JS files
    └── webview/ (copied assets)
         ├── petView.html
         ├── petView.css
         └── petView.js

Resources (resources/)
    ├── ghost-icon.svg
    └── sprites/
         ├── ghost-sprites.png
         ├── pumpkin-sprites.png
         └── skeleton-sprites.png

         ↓ [VSCE Package]
         
VSIX Bundle
    ├── out/ (compiled code + webview)
    ├── resources/ (sprites + icons)
    ├── node_modules/ (runtime deps only)
    └── package.json
```

### File Inclusion Strategy

The packaging process uses a **whitelist approach** via .vscodeignore:
- Exclude everything from src/ (source TypeScript)
- Include everything from out/ (compiled JavaScript)
- Include resources/ directory (sprites and icons)
- Include only runtime dependencies from node_modules/
- Exclude all development files (tests, configs, .git, etc.)

## Components and Interfaces

### 1. TypeScript Compilation

**Current State:**
- tsconfig.json is properly configured with rootDir: "src" and outDir: "out"
- Compiler targets ES2022 with Node16 module resolution
- Source maps are enabled for debugging

**Required Changes:**
- No changes needed to tsconfig.json - it's already correct
- Ensure all TypeScript files compile without errors

### 2. Webview Asset Bundling

**Current State:**
- package.json has a "copy-webview" script that copies src/webview to out/webview
- The compile script chains: `tsc -p ./ && npm run copy-webview`

**Required Changes:**
- Verify the copy-webview script works correctly on all platforms
- Ensure webview files are referenced correctly in PetPanelProvider

**Implementation:**
```json
"copy-webview": "node -e \"require('fs').cpSync('src/webview', 'out/webview', {recursive: true})\""
```

This uses Node.js built-in fs.cpSync which is cross-platform compatible.

### 3. Package Manifest (package.json)

**Current State Analysis:**
- ✅ Has main entry point: "./out/extension.js"
- ✅ Has activation events: ["onStartupFinished"]
- ✅ Has commands defined in contributes
- ✅ Has views and viewsContainers defined
- ✅ Has configuration properties defined
- ✅ Has vscode:prepublish script
- ⚠️ Description is generic: "This is the part of VSCode ThemePackage"
- ⚠️ DisplayName is not user-friendly: "halloween-phantom-pet"
- ✅ Publisher is set: "fishperson113"
- ✅ Dependencies are properly separated (runtime vs dev)

**Required Changes:**
1. Update description to be more meaningful
2. Update displayName to be user-friendly
3. Verify all commands are registered
4. Ensure categories are appropriate

**Proposed Updates:**
```json
{
  "displayName": "Spooky Code Pets",
  "description": "Animated spooky companions that provide AI-powered code commentary with personality",
  "categories": ["Other", "Visualization"],
  "keywords": ["pet", "companion", "ai", "halloween", "animation"]
}
```

### 4. .vscodeignore Configuration

**Current State:**
```
.vscode/**
.vscode-test/**
src/**
.gitignore
.yarnrc
vsc-extension-quickstart.md
**/tsconfig.json
**/eslint.config.mjs
**/*.map
**/*.ts
**/.vscode-test.*
```

**Analysis:**
- ✅ Excludes src/ directory
- ✅ Excludes TypeScript files
- ✅ Excludes config files
- ⚠️ Excludes source maps (*.map) - may want to include for debugging
- ❌ Missing exclusions for test files
- ❌ Missing exclusions for documentation files
- ❌ Missing exclusions for build artifacts
- ❌ Not excluding node_modules devDependencies

**Required Changes:**
Add comprehensive exclusions while being explicit about inclusions.

**Proposed .vscodeignore:**
```
# Source files
src/**
**/*.ts
!out/**/*.ts

# Tests
**/test/**
**/*.test.js
**/*.test.ts
.vscode-test/**
.vscode-test-user-data/**
.vscode-test.mjs

# Build configs
tsconfig.json
eslint.config.mjs
.eslintrc*

# Development files
.vscode/**
.gitignore
.yarnrc
.git/**
.github/**

# Documentation (keep README)
vsc-extension-quickstart.md
CHANGELOG.md

# Build artifacts
**/*.map
*.vsix

# Node modules (vsce handles this automatically)
# We rely on vsce to include only production dependencies

# Misc
.DS_Store
*.log
test-movement.html
SPRITE_GUIDE.md
resources/sprites/README.md
resources/sprites/SPRITE_TEMPLATE.md
resources/sprites/.gitkeep
```

### 5. Resource File Handling

**Current State:**
- Sprite PNG files are in resources/sprites/
- Icon SVG is in resources/
- Extension references these via VS Code resource URIs

**Required Changes:**
- Ensure resources/ directory is NOT in .vscodeignore
- Verify resource paths work in packaged extension
- Test that webview can load sprites from packaged location

**Resource URI Pattern:**
```typescript
const resourceUri = this._view.webview.asWebviewUri(
  vscode.Uri.joinPath(this._extensionUri, 'resources', 'sprites', 'ghost-sprites.png')
);
```

This pattern works in both development and packaged environments.

## Data Models

### Build Output Structure

```typescript
interface BuildOutput {
  out: {
    extension.js: CompiledCode;
    models: Directory;
    services: Directory;
    providers: Directory;
    personalities: Directory;
    sprites: Directory;
    webview: {
      'petView.html': HTMLFile;
      'petView.css': CSSFile;
      'petView.js': JavaScriptFile;
    };
  };
  resources: {
    'ghost-icon.svg': SVGFile;
    sprites: {
      'ghost-sprites.png': PNGFile;
      'pumpkin-sprites.png': PNGFile;
      'skeleton-sprites.png': PNGFile;
    };
  };
  'package.json': ManifestFile;
  node_modules: RuntimeDependencies;
}
```

### Package Validation Result

```typescript
interface PackageValidationResult {
  hasMainEntry: boolean;
  mainEntryExists: boolean;
  activationEventsValid: boolean;
  commandsRegistered: boolean;
  dependenciesResolved: boolean;
  errors: string[];
  warnings: string[];
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Compilation completeness
*For any* valid TypeScript source file in src/, running the compile script should produce a corresponding JavaScript file in out/ with the same relative path structure
**Validates: Requirements 1.1**

### Property 2: Webview asset bundling completeness  
*For any* file in src/webview/, running the compile script should produce an identical copy in out/webview/ with the same content
**Validates: Requirements 2.1**

### Property 3: Webview assets in package
*For any* webview file (HTML, CSS, JS) in out/webview/, the packaged .vsix must contain that file
**Validates: Requirements 2.3**

### Property 4: Resource inclusion in package
*For any* file in resources/ (including sprites and icons), the packaged .vsix must contain that file at the same relative path
**Validates: Requirements 3.1, 3.2, 4.9**

### Property 5: Source exclusion from package
*For any* TypeScript source file in src/, the packaged .vsix must NOT contain that source file
**Validates: Requirements 4.1**

### Property 6: DevDependency exclusion from package
*For any* package listed in devDependencies in package.json, the packaged .vsix must NOT contain that package in node_modules
**Validates: Requirements 4.2**

### Property 7: Test exclusion from package
*For any* test file matching patterns *.test.ts, *.test.js, or files in src/test/, the packaged .vsix must NOT contain those files
**Validates: Requirements 4.3**

### Property 8: Compiled output inclusion in package
*For any* JavaScript file in out/ (excluding test files), the packaged .vsix must contain that file
**Validates: Requirements 4.7**

### Property 9: Runtime dependency inclusion in package
*For any* package listed in dependencies in package.json, the packaged .vsix must contain that package in node_modules
**Validates: Requirements 4.8**

### Property 10: Command registration completeness
*For any* command ID used in the extension code or referenced in activation events, that command must be declared in package.json contributes.commands
**Validates: Requirements 5.2, 6.4**

### Property 11: VSCE validation success
*For any* properly configured extension with valid build output, running `vsce package` should complete without errors or warnings and produce a valid .vsix file
**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7**

### Property 12: Build script idempotence
*For any* source state, running the compile script multiple times consecutively should produce identical output each time
**Validates: Requirements 9.4**

### Property 13: Installed extension command execution
*For any* command registered in package.json contributes.commands, executing that command in the installed extension should complete without throwing errors
**Validates: Requirements 10.5**

## Error Handling

### Build Errors

**TypeScript Compilation Errors:**
- **Detection:** TypeScript compiler returns non-zero exit code
- **Handling:** Display compilation errors with file locations and descriptions
- **Recovery:** Fix TypeScript errors in source files and rebuild

**Webview Copy Errors:**
- **Detection:** fs.cpSync throws an error
- **Handling:** Log error message indicating which files failed to copy
- **Recovery:** Ensure src/webview directory exists and contains required files

### Packaging Errors

**Missing Main Entry:**
- **Detection:** vsce reports "Extension entrypoint doesn't exist"
- **Handling:** Verify out/extension.js exists after build
- **Recovery:** Run compile script before packaging

**Invalid Activation Events:**
- **Detection:** vsce reports activation event warnings
- **Handling:** Verify activation events match registered commands
- **Recovery:** Update package.json activationEvents or contributes.commands

**Missing Dependencies:**
- **Detection:** vsce reports missing dependencies
- **Handling:** Check that all runtime dependencies are in dependencies (not devDependencies)
- **Recovery:** Move required packages from devDependencies to dependencies

### Installation Errors

**Extension Activation Failure:**
- **Detection:** VS Code shows "Extension activation failed" error
- **Handling:** Check VS Code developer console for error details
- **Recovery:** Verify all required files are included in package, check resource paths

**Missing Resources:**
- **Detection:** Webview fails to load sprites or assets
- **Handling:** Verify resource URIs use correct webview URI scheme
- **Recovery:** Ensure resources/ directory is included in package, check .vscodeignore

## Testing Strategy

### Build Verification Tests

**Unit Tests:**
1. Test that compile script successfully compiles TypeScript
2. Test that webview assets are copied to correct location
3. Test that out/extension.js exists after build
4. Test that all expected output files are present

**Property-Based Tests:**
1. Property 1: For random TypeScript files, verify compilation produces output
2. Property 2: Verify main entry point always exists after successful build
3. Property 3: For random webview files, verify they're copied correctly
4. Property 11: Verify build script produces same output when run multiple times

### Package Verification Tests

**Unit Tests:**
1. Test that .vscodeignore excludes expected files
2. Test that package.json has all required fields
3. Test that vsce package command succeeds
4. Test that produced .vsix file exists

**Property-Based Tests:**
1. Property 4: For all sprite files, verify they're in the package
2. Property 5: For all source files, verify they're NOT in the package
3. Property 6: For all test files, verify they're NOT in the package
4. Property 7: For all compiled files, verify they're in the package
5. Property 8: Verify package manifest has all required fields
6. Property 9: For all commands, verify they're registered in package.json
7. Property 10: Verify vsce package succeeds without errors

### Installation Verification Tests

**Manual Tests:**
1. Install .vsix file in VS Code
2. Verify extension activates without errors
3. Verify pet panel displays correctly
4. Verify sprites load correctly
5. Verify all commands work
6. Verify webview content loads

**Property-Based Tests:**
1. Property 12: Verify packaged extension can be installed successfully

### Testing Tools

- **Property-Based Testing Library:** fast-check (already in devDependencies)
- **Test Framework:** Mocha (already in devDependencies)
- **VS Code Testing:** @vscode/test-electron (already in devDependencies)
- **Package Inspection:** Manual inspection of .vsix contents (it's a ZIP file)
- **VSCE Validation:** Run `vsce package` and check for errors/warnings

### Test Configuration

- Property-based tests should run a minimum of 100 iterations
- Each property test must be tagged with: `**Feature: extension-packaging, Property {number}: {property_text}**`
- Tests should verify both positive cases (correct files included) and negative cases (incorrect files excluded)

## Implementation Notes

### Cross-Platform Considerations

- Use Node.js built-in `fs.cpSync` for file copying (works on Windows, Mac, Linux)
- Use forward slashes in paths within package.json scripts
- Test packaging on multiple platforms if possible

### VSCE Behavior

- VSCE automatically excludes devDependencies from node_modules
- VSCE respects .vscodeignore patterns
- VSCE validates package.json structure and required fields
- VSCE checks that main entry point file exists

### Development Workflow

1. **Development:** `npm run watch` - continuous TypeScript compilation
2. **Testing:** `npm test` - run all tests including property tests
3. **Building:** `npm run compile` - full build with webview copy
4. **Packaging:** `vsce package` - create .vsix file
5. **Installation:** `code --install-extension halloween-phantom-pet-0.0.1.vsix`

### Debugging Packaged Extension

- Source maps are excluded from package (*.map in .vscodeignore)
- For debugging packaged extension, temporarily include source maps
- Use VS Code's "Developer: Toggle Developer Tools" to inspect webview
- Check extension host logs for activation errors

## Dependencies

### Runtime Dependencies (must be in dependencies)
- node-fetch: ^3.3.0 (for LLM API calls)
- zod: ^4.1.13 (for response validation)

### Development Dependencies (in devDependencies)
- TypeScript compiler and types
- Testing frameworks (Mocha, fast-check)
- Linting tools (ESLint)
- VS Code test utilities
- VSCE (should be installed globally: `npm install -g @vscode/vsce`)

## Validation Checklist

Before considering packaging complete, verify:

- [ ] `npm run compile` succeeds without errors
- [ ] out/extension.js exists and is valid JavaScript
- [ ] out/webview/ contains all HTML, CSS, JS files
- [ ] resources/ directory contains all sprites and icons
- [ ] package.json has meaningful displayName and description
- [ ] package.json lists all commands in contributes.commands
- [ ] .vscodeignore excludes src/ and test files
- [ ] .vscodeignore includes out/ and resources/
- [ ] `vsce package` succeeds without errors or warnings
- [ ] .vsix file is created
- [ ] .vsix file can be installed in VS Code
- [ ] Installed extension activates successfully
- [ ] Pet panel displays with sprites
- [ ] All commands execute successfully
- [ ] Webview content loads correctly

## Future Enhancements

- Consider using webpack or esbuild for more optimized bundling
- Add CI/CD pipeline for automated packaging and testing
- Create automated tests for package contents verification
- Add package size optimization analysis
- Consider splitting large dependencies or using tree-shaking
