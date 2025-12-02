# Implementation Plan

- [x] 1. Update package.json metadata for marketplace readiness




  - Update displayName to "Spooky Code Pets"
  - Update description to be meaningful and descriptive
  - Add "Visualization" to categories array
  - Add keywords array for marketplace discoverability
  - Verify publisher field is set correctly
  - Verify version follows semantic versioning
  - Verify engines.vscode specifies correct minimum version
  - _Requirements: 6.1, 6.2, 6.3, 6.7, 6.10_

- [x] 2. Verify and fix build pipeline configuration






  - [x] 2.1 Verify TypeScript compilation configuration

    - Check tsconfig.json has correct rootDir and outDir
    - Verify target and module settings are appropriate
    - Ensure all TypeScript files compile without errors
    - _Requirements: 1.1, 1.5_


  - [x] 2.2 Verify webview asset copying

    - Check that copy-webview script uses cross-platform compatible method
    - Verify script copies all files from src/webview to out/webview
    - Test that compile script runs both tsc and copy-webview in correct order
    - _Requirements: 2.1_

  - [ ]* 2.3 Write property test for compilation completeness
    - **Property 1: Compilation completeness**
    - **Validates: Requirements 1.1**

  - [ ]* 2.4 Write property test for webview bundling
    - **Property 2: Webview asset bundling completeness**
    - **Validates: Requirements 2.1**

  - [ ]* 2.5 Write property test for build idempotence
    - **Property 12: Build script idempotence**
    - **Validates: Requirements 9.4**

- [x] 3. Update .vscodeignore for proper file exclusion/inclusion





  - Add comprehensive exclusions for source files (src/**)
  - Add exclusions for test files and test configuration
  - Add exclusions for build configuration files
  - Add exclusions for development files (.vscode/, .git/, etc.)
  - Add exclusions for documentation files (keep README.md)
  - Add exclusions for misc files (test-movement.html, sprite guides)
  - Verify resources/ directory is NOT excluded
  - Verify out/ directory is NOT excluded
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.9_
-

- [x] 4. Verify package.json scripts are complete




  - Verify "compile" script exists and runs tsc + copy-webview
  - Verify "vscode:prepublish" script exists and runs compile
  - Verify "watch" script exists for development
  - Test that compile script produces complete output
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_







- [ ] 5. Verify package.json contributions are complete

  - [ ] 5.1 Verify all commands are registered
    - Check spookyPets.setApiKey is in contributes.commands


    - Check spookyPets.clearApiKey is in contributes.commands
    - Check spookyPets.selectPet is in contributes.commands
    - Check spookyPets.triggerCommentary is in contributes.commands


    - _Requirements: 5.2, 6.4_

  - [ ] 5.2 Verify activation events are correct
    - Check "onStartupFinished" is in activationEvents


    - Verify activation events match extension functionality
    - _Requirements: 5.1, 5.5_

  - [ ] 5.3 Verify views and viewsContainers are configured
    - Check viewsContainers.activitybar includes spooky-pets
    - Check views includes spookyPets.petView
    - Verify icon paths are correct
    - _Requirements: 5.3_

  - [ ] 5.4 Verify configuration properties are defined
    - Check all settings are in contributes.configuration
    - Verify default values are appropriate
    - _Requirements: 6.5_

  - [ ]* 5.5 Write property test for command registration
    - **Property 10: Command registration completeness**
    - **Validates: Requirements 5.2, 6.4**

- [x] 6. Verify resource file paths work in packaged extension



  - Check that PetPanelProvider uses webview.asWebviewUri for resources
  - Verify sprite paths use Uri.joinPath with extensionUri
  - Verify icon paths in package.json are relative to extension root
  - Test that resource URIs work in both dev and packaged modes
  - _Requirements: 3.3, 3.4_




- [ ] 7. Run build and verify output structure

  - Run npm run compile
  - Verify out/extension.js exists
  - Verify out/webview/ contains all HTML, CSS, JS files
  - Verify all TypeScript files have corresponding JS files in out/


  - Check for any compilation errors or warnings
  - _Requirements: 1.1, 1.2, 2.1, 2.2_


- [ ] 8. Test packaging with vsce
  - [ ] 8.1 Install vsce if not already installed
    - Run: npm install -g @vscode/vsce
    - _Requirements: 7.1_

  - [ ] 8.2 Run vsce package and verify success
    - Run: vsce package
    - Verify command completes without errors
    - Verify no warnings are produced
    - Verify .vsix file is created
    - _Requirements: 7.1, 7.2, 7.7_

  - [ ]* 8.3 Write property test for vsce validation
    - **Property 11: VSCE validation success**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7**

- [ ] 9. Inspect packaged .vsix contents
  - [ ] 9.1 Extract and verify file inclusions
    - Unzip .vsix file (it's a ZIP archive)
    - Verify extension/out/ directory contains compiled JS files
    - Verify extension/resources/ directory contains sprites and icons
    - Verify extension/out/webview/ contains HTML, CSS, JS files
    - _Requirements: 2.3, 3.1, 3.2, 4.7, 4.9_

  - [ ] 9.2 Verify file exclusions
    - Verify no TypeScript source files from src/ are included
    - Verify no test files are included
    - Verify no build config files are included
    - Verify no .vscode/ or .git/ directories are included
    - Verify devDependencies are not in node_modules
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ] 9.3 Verify runtime dependencies are included
    - Check that node-fetch is in extension/node_modules
    - Check that zod is in extension/node_modules
    - _Requirements: 4.8_

  - [ ]* 9.4 Write property test for source exclusion
    - **Property 5: Source exclusion from package**
    - **Validates: Requirements 4.1**

  - [ ]* 9.5 Write property test for test exclusion
    - **Property 7: Test exclusion from package**
    - **Validates: Requirements 4.3**

  - [ ]* 9.6 Write property test for compiled output inclusion
    - **Property 8: Compiled output inclusion in package**
    - **Validates: Requirements 4.7**

  - [ ]* 9.7 Write property test for resource inclusion
    - **Property 4: Resource inclusion in package**
    - **Validates: Requirements 3.1, 3.2, 4.9**

  - [ ]* 9.8 Write property test for webview assets in package
    - **Property 3: Webview assets in package**
    - **Validates: Requirements 2.3**

  - [ ]* 9.9 Write property test for devDependency exclusion
    - **Property 6: DevDependency exclusion from package**
    - **Validates: Requirements 4.2**

  - [ ]* 9.10 Write property test for runtime dependency inclusion
    - **Property 9: Runtime dependency inclusion in package**
    - **Validates: Requirements 4.8**

- [ ] 10. Test installation and activation of packaged extension
  - [ ] 10.1 Install the .vsix file
    - Run: code --install-extension halloween-phantom-pet-0.0.1.vsix
    - Verify installation succeeds without errors
    - _Requirements: 10.1_

  - [ ] 10.2 Verify extension activates correctly
    - Open VS Code and check extension is activated
    - Check for any activation errors in developer console
    - Verify no errors in Output > Extension Host
    - _Requirements: 10.2_

  - [ ] 10.3 Verify pet panel displays
    - Open the Spooky Pets panel in the activity bar
    - Verify pet view loads without errors
    - Check developer console for any resource loading errors
    - _Requirements: 10.3_

  - [ ] 10.4 Verify sprites load correctly
    - Check that pet sprite is visible in the panel
    - Verify no 404 errors for sprite resources
    - Test pet animation works
    - _Requirements: 10.4_

  - [ ] 10.5 Verify webview content loads
    - Check that webview HTML, CSS, and JS load correctly
    - Verify no resource loading errors in webview console
    - _Requirements: 10.6_

  - [ ] 10.6 Test all commands execute successfully
    - Run command: Spooky Pets: Select Pet
    - Run command: Spooky Pets: Set API Key
    - Run command: Spooky Pets: Clear API Key
    - Run command: Spooky Pets: Trigger Commentary Now
    - Verify each command executes without errors
    - _Requirements: 10.5_

  - [ ]* 10.7 Write property test for command execution
    - **Property 13: Installed extension command execution**
    - **Validates: Requirements 10.5**

- [ ] 11. Clean up unnecessary files from repository
  - Review project for unused test files or scaffolding
  - Remove any temporary or obsolete files
  - Verify .gitignore excludes generated files (out/, *.vsix)
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 12. Final verification checkpoint
  - Ensure all tests pass, ask the user if questions arise
  - Verify npm run compile succeeds
  - Verify vsce package succeeds without warnings
  - Verify .vsix installs and activates correctly
  - Verify all commands work in installed extension
  - Verify sprites and webview load correctly
