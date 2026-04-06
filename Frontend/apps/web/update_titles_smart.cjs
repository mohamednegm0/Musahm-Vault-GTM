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
            if (nameNode.getText() === "title") {
                const jsxAttributes = node.getParentIfKind(SyntaxKind.JsxAttributes);
                if (!jsxAttributes) return;
                
                const element = jsxAttributes.getParentIfKind(SyntaxKind.JsxOpeningElement) || 
                                jsxAttributes.getParentIfKind(SyntaxKind.JsxSelfClosingElement);
                if (!element) return;
                
                const tagName = element.getTagNameNode().getText();
                
                if (/^[a-z]/.test(tagName) && tagName !== "iframe" && tagName !== "option") {
                    
                    let hasVisibleText = false;
                    const jsxElement = element.getParentIfKind(SyntaxKind.JsxElement);
                    if (jsxElement) {
                        // Traverse carefully: only look at JsxText or JsxExpression that are children of JsxElement
                        const descendants = jsxElement.getDescendants();
                        for (const child of descendants) {
                            if (hasVisibleText) break;
                            
                            if (child.getKind() === SyntaxKind.JsxText) {
                                if (child.getText().trim().length > 0) {
                                    hasVisibleText = true;
                                }
                            } else if (child.getKind() === SyntaxKind.JsxExpression) {
                                const parentKind = child.getParent()?.getKind();
                                // Ensure the JsxExpression is inside JSX elements as text, not inside attributes
                                if (parentKind === SyntaxKind.JsxElement || parentKind === SyntaxKind.JsxFragment) {
                                    const expr = child.getExpression();
                                    if (expr) {
                                        hasVisibleText = true;
                                    }
                                }
                            }
                        }
                    }

                    if (/^h[1-6]$/.test(tagName) || tagName === 'p') {
                        hasVisibleText = true;
                    }

                    if (hasVisibleText) {
                        node.remove();
                        changed = true;
                    } else {
                        // Change 'title' to 'data-tooltip-content' where there's NO visible text
                        nameNode.replaceWithText("data-tooltip-content");
                        changed = true;
                    }
                }
            }
        }
    });

    if (changed) {
        console.log(`Updated: ${sf.getFilePath()}`);
        sf.saveSync();
        changedFiles++;
    }
}
console.log(`Total files updated: ${changedFiles}`);
