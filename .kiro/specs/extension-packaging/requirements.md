# Requirements Document

## Introduction

The halloween-phantom-pet VSCode extension requires proper packaging configuration to be published to the marketplace. Unlike a theme-only extension, this extension contains TypeScript code, webview UI, commands, and settings that must be compiled, bundled, and packaged correctly. The extension must pass `vsce package` validation without errors or warnings and produce a clean, optimized .vsix file ready for distribution.

## Glossary

- **Extension**: The halloween-phantom-pet VSCode extension application
- **VSCE**: Visual Studio Code Extension Manager CLI tool used to package and publish extensions
- **VSIX**: The packaged extension file format (.vsix) that can be installed in VS Code
- **Main Entry Point**: The compiled JavaScript file (out/extension.js) that VS Code loads when activating the extension
- **Webview Assets**: HTML, CSS, and JavaScript files used by the extension's webview UI
- **Build Pipeline**: The compilation process that transforms TypeScript source code into JavaScript output
- **Bundle**: The complete set of compiled code and assets included in the packaged extension
- **vscodeignore**: Configuration file that specifies which files to exclude from the packaged extension
- **Activation Events**: VS Code configuration that specifies when the extension should be loaded
- **Package Manifest**: The package.json file containing extension metadata and configuration

## Requirements

### Requirement 1

**User Story:** As an extension developer, I want a valid TypeScript compilation pipeline, so that my source code is properly compiled to JavaScript for distribution.

#### Acceptance Criteria

1. WHEN the build command runs, THE Extension SHALL compile all TypeScript files from src/ to out/
2. WHEN compilation completes, THE Extension SHALL produce a valid out/extension.js entry point file
3. WHEN the Package Manifest references the main entry point, THE Extension SHALL use the path "./out/extension.js"
4. WHEN TypeScript compilation encounters errors, THE Build Pipeline SHALL report errors and fail the build
5. THE Extension SHALL use TypeScript configuration that targets the appropriate VS Code engine version

### Requirement 2

**User Story:** As an extension developer, I want webview assets properly bundled, so that the extension's UI works correctly when packaged.

#### Acceptance Criteria

1. WHEN the build command runs, THE Extension SHALL copy all Webview Assets from src/webview/ to out/webview/
2. WHEN the extension loads webview content, THE Extension SHALL reference Webview Assets from the out/webview/ directory
3. WHEN packaging the extension, THE Bundle SHALL include all required HTML, CSS, and JavaScript webview files
4. THE Extension SHALL ensure webview resource URIs use proper VS Code webview URI schemes
5. WHEN webview assets are missing, THE Build Pipeline SHALL report an error

### Requirement 3

**User Story:** As an extension developer, I want sprite assets included in the package, so that pet animations display correctly in the installed extension.

#### Acceptance Criteria

1. WHEN packaging the extension, THE Bundle SHALL include all sprite PNG files from resources/sprites/
2. WHEN packaging the extension, THE Bundle SHALL include the ghost-icon.svg file from resources/
3. WHEN the extension references sprite files, THE Extension SHALL use paths relative to the extension root
4. THE Extension SHALL ensure sprite file paths work correctly in both development and packaged environments
5. WHEN sprite assets are missing, THE Extension SHALL handle the error gracefully per existing error handling requirements

### Requirement 4

**User Story:** As an extension developer, I want a properly configured .vscodeignore file, so that unnecessary files are excluded from the packaged extension.

#### Acceptance Criteria

1. WHEN packaging the extension, THE Bundle SHALL exclude all TypeScript source files from src/
2. WHEN packaging the extension, THE Bundle SHALL exclude node_modules development dependencies
3. WHEN packaging the extension, THE Bundle SHALL exclude test files and test configuration
4. WHEN packaging the extension, THE Bundle SHALL exclude build configuration files (tsconfig.json, eslint.config.mjs)
5. WHEN packaging the extension, THE Bundle SHALL exclude version control files (.git, .gitignore)
6. WHEN packaging the extension, THE Bundle SHALL exclude editor configuration files (.vscode/, .vscode-test-user-data/)
7. WHEN packaging the extension, THE Bundle SHALL include only compiled JavaScript files from out/
8. WHEN packaging the extension, THE Bundle SHALL include required runtime dependencies from node_modules
9. WHEN packaging the extension, THE Bundle SHALL include all resource files (sprites, icons)
10. THE Extension SHALL maintain a .vscodeignore file that produces an optimized package size

### Requirement 5

**User Story:** As an extension developer, I want valid activation events configured, so that VS Code loads my extension at the appropriate time.

#### Acceptance Criteria

1. WHEN the Package Manifest defines activation events, THE Extension SHALL include "onStartupFinished" for automatic activation
2. WHEN the Package Manifest defines commands, THE Extension SHALL register all command identifiers in the contributes.commands section
3. WHEN the Package Manifest defines views, THE Extension SHALL register the webview view in the contributes.views section
4. THE Extension SHALL ensure all activation events match the extension's actual functionality
5. WHEN VS Code loads the extension, THE Extension SHALL activate successfully using the configured events

### Requirement 6

**User Story:** As an extension developer, I want a complete and accurate package.json, so that the extension metadata is correct and all features are properly declared.

#### Acceptance Criteria

1. THE Package Manifest SHALL include a valid publisher identifier
2. THE Package Manifest SHALL include a meaningful displayName and description
3. THE Package Manifest SHALL specify the correct VS Code engine version compatibility
4. THE Package Manifest SHALL list all extension commands in contributes.commands
5. THE Package Manifest SHALL define all configuration properties in contributes.configuration
6. THE Package Manifest SHALL specify the correct main entry point path
7. THE Package Manifest SHALL include appropriate categories for marketplace listing
8. THE Package Manifest SHALL define a vscode:prepublish script that runs the build
9. THE Package Manifest SHALL separate runtime dependencies from devDependencies correctly
10. THE Package Manifest SHALL include a version number following semantic versioning

### Requirement 7

**User Story:** As an extension developer, I want the extension to pass vsce package validation, so that I can successfully create a distributable .vsix file.

#### Acceptance Criteria

1. WHEN running vsce package, THE Extension SHALL complete packaging without errors
2. WHEN running vsce package, THE Extension SHALL produce a valid .vsix file
3. WHEN vsce validates the package, THE Extension SHALL pass all validation checks
4. WHEN vsce checks the main entry point, THE Extension SHALL have a valid compiled extension.js file
5. WHEN vsce checks activation events, THE Extension SHALL have properly configured events matching the commands and views
6. WHEN vsce analyzes dependencies, THE Extension SHALL have all required dependencies properly declared
7. THE Extension SHALL produce no warnings during the packaging process

### Requirement 8

**User Story:** As an extension developer, I want to remove unnecessary files from the project, so that the repository and package are clean and maintainable.

#### Acceptance Criteria

1. WHEN reviewing the project structure, THE Extension SHALL contain no unused test files or scaffolding
2. WHEN reviewing the project structure, THE Extension SHALL contain no duplicate or obsolete configuration files
3. WHEN reviewing the project structure, THE Extension SHALL contain no temporary or generated files in source control
4. THE Extension SHALL maintain only files necessary for development, building, and packaging
5. WHEN packaging the extension, THE Bundle SHALL exclude all unnecessary files via .vscodeignore

### Requirement 9

**User Story:** As an extension developer, I want clear build and package scripts, so that I can reliably build and package the extension.

#### Acceptance Criteria

1. THE Package Manifest SHALL define a "compile" script that builds TypeScript and copies webview assets
2. THE Package Manifest SHALL define a "vscode:prepublish" script that runs before packaging
3. THE Package Manifest SHALL define a "watch" script for development
4. WHEN the compile script runs, THE Build Pipeline SHALL complete all necessary build steps in the correct order
5. WHEN the vscode:prepublish script runs, THE Build Pipeline SHALL produce a complete, ready-to-package output
6. THE Extension SHALL document the build and package process in the README or development documentation

### Requirement 10

**User Story:** As an extension developer, I want to verify the packaged extension works correctly, so that I can confidently distribute it to users.

#### Acceptance Criteria

1. WHEN the .vsix file is created, THE Extension SHALL be installable in VS Code
2. WHEN the packaged extension is installed, THE Extension SHALL activate without errors
3. WHEN the packaged extension is activated, THE Extension SHALL display the pet panel correctly
4. WHEN the packaged extension is activated, THE Extension SHALL load all sprite assets correctly
5. WHEN the packaged extension is activated, THE Extension SHALL execute all registered commands successfully
6. WHEN the packaged extension is activated, THE Extension SHALL load webview content correctly
7. THE Extension SHALL function identically in packaged form as in development mode
