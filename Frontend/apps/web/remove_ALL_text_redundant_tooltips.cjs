const { Project, SyntaxKind } = require("ts-morph");
const project = new Project();
project.addSourceFilesAtPaths("src/**/*.tsx");
const sourceFiles = project.getSourceFiles();

let changedFiles = 0;

for (const sf of sourceFiles) {
    let changed = false;
    
    sf.forEachDescendant(node => {
        if (node.getKind() === SyntaxKind.JsxAttribute) {
            const nameNode = node.getNameNode();
            if (nameNode.getText() === "data-tooltip-content") {
                const jsxAttributes = node.getParentIfKind(SyntaxKind.JsxAttributes);
                if (!jsxAttributes) return;
                
                const element = jsxAttributes.getParentIfKind(SyntaxKind.JsxOpeningElement) || 
                                jsxAttributes.getParentIfKind(SyntaxKind.JsxSelfClosingElement);
                if (!element) return;

                const jsxElement = element.getParentIfKind(SyntaxKind.JsxElement);
                if (jsxElement) {
                    let hasVisibleText = false;
                    
                    // Recursively check all descendants of the element for any visible text
                    jsxElement.forEachDescendant(child => {
                        if (hasVisibleText) return; // already found
                        
                        if (child.getKind() === SyntaxKind.JsxText) {
                            if (child.getText().trim().length > 0) {
                                hasVisibleText = true;
                            }
                        } else if (child.getKind() === SyntaxKind.JsxExpression) {
                            // If it's an expression like {t('something')} or {language} or {item.name}, it produces text
                            const expr = child.getExpression();
                            // ignore empty expressions or comments
                            if (expr) {
                                hasVisibleText = true;
                            }
                        }
                    });

                    // We also remove it if it's placed on an element that usually denotes text blocks
                    const tagName = element.getTagNameNode().getText();
                    if (/^h[1-6]$/.test(tagName) || tagName === 'p') {
                        hasVisibleText = true;
                    }

                    if (hasVisibleText) {
                        node.remove();
                        changed = true;
                    }
                }
            }
        }
    });

    if (changed) {
        console.log(`Cleaned up text-evident tooltip: ${sf.getFilePath()}`);
        sf.saveSync();
        changedFiles++;
    }
}
console.log(`Total files cleaned: ${changedFiles}`);
