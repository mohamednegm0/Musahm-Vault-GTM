const { Project, SyntaxKind } = require("ts-morph");
const project = new Project();
project.addSourceFilesAtPaths("src/**/*.tsx");
const sourceFiles = project.getSourceFiles();

let changedFiles = 0;

for (const sf of sourceFiles) {
    let changed = false;
    
    // We get all data-tooltip-content attributes
    sf.forEachDescendant(node => {
        if (node.getKind() === SyntaxKind.JsxAttribute) {
            const nameNode = node.getNameNode();
            if (nameNode.getText() === "data-tooltip-content") {
                const jsxAttributes = node.getParentIfKind(SyntaxKind.JsxAttributes);
                if (!jsxAttributes) return;
                
                const element = jsxAttributes.getParentIfKind(SyntaxKind.JsxOpeningElement) || 
                                jsxAttributes.getParentIfKind(SyntaxKind.JsxSelfClosingElement);
                if (!element) return;
                
                const tagName = element.getTagNameNode().getText();
                
                // Revert to title for iframe and option
                if (tagName === "iframe" || tagName === "option") {
                    nameNode.replaceWithText("title");
                    changed = true;
                    return;
                }
                
                // Remove from heading tags
                if (/^h[1-6]$/.test(tagName)) {
                    node.remove();
                    changed = true;
                    return;
                }
                
                // Check if the attribute maps exactly to child expression
                const jsxElement = element.getParentIfKind(SyntaxKind.JsxElement);
                if (jsxElement) {
                    const children = jsxElement.getJsxChildren();
                    // If exactly one child and it's a JSX Expression
                    if (children.length === 1 || (children.length === 3 && children[1].getKind() === SyntaxKind.JsxExpression)) {
                        // find the single jsx expression child
                        const jsxExprs = children.filter(c => c.getKind() === SyntaxKind.JsxExpression);
                        if (jsxExprs.length === 1) {
                            const exprChildText = jsxExprs[0].getExpression()?.getText();
                            const attrInit = node.getInitializer();
                            if (attrInit && attrInit.getKind() === SyntaxKind.JsxExpression) {
                                const attrExprText = attrInit.getExpression()?.getText();
                                if (attrExprText === exprChildText) {
                                    node.remove();
                                    changed = true;
                                    return;
                                }
                            }
                        }
                    }
                    
                    // If exactly one child and it's just raw text
                    const init = node.getInitializer();
                    if (init && init.getKind() === SyntaxKind.StringLiteral) {
                        const content = init.getLiteralValue();
                        const textChildren = children.filter(c => c.getKind() === SyntaxKind.JsxText);
                        if (textChildren.length > 0) {
                            const text = textChildren.map(c => c.getText()).join('').trim();
                            if (text === content) {
                                node.remove();
                                changed = true;
                                return;
                            }
                        }
                    }
                }
            }
        }
    });

    if (changed) {
        console.log(`Cleaned up: ${sf.getFilePath()}`);
        sf.saveSync();
        changedFiles++;
    }
}
console.log(`Total files cleaned up: ${changedFiles}`);
