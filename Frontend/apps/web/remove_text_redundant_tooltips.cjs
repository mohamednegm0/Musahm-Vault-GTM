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
                    const children = jsxElement.getJsxChildren();
                    const attrInit = node.getInitializer();
                    
                    if (attrInit && attrInit.getKind() === SyntaxKind.JsxExpression) {
                        const attrExprText = attrInit.getExpression()?.getText()?.trim();
                        // Check if any child expression matches the tooltip expression
                        const jsxExprs = children.filter(c => c.getKind() === SyntaxKind.JsxExpression);
                        for (const childExpr of jsxExprs) {
                            const childText = childExpr.getExpression()?.getText()?.trim();
                            if (attrExprText === childText || attrExprText.startsWith(childText) || childText.startsWith(attrExprText)) {
                                node.remove();
                                changed = true;
                                return;
                            }
                        }
                    }
                    
                    // Also if it's a string literal and there's text matching
                    if (attrInit && attrInit.getKind() === SyntaxKind.StringLiteral) {
                        const content = attrInit.getLiteralValue().trim();
                        const textChildren = children.filter(c => c.getKind() === SyntaxKind.JsxText);
                        for (const childTextNode of textChildren) {
                            const childText = childTextNode.getText().trim();
                            if (childText && (childText === content || childText.includes(content))) {
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
        console.log(`Cleaned up redundantly named tooltip: ${sf.getFilePath()}`);
        sf.saveSync();
        changedFiles++;
    }
}
console.log(`Total files cleaned: ${changedFiles}`);
