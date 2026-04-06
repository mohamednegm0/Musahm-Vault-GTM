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
                if (jsxAttributes) {
                    const parent = jsxAttributes.getParentIfKind(SyntaxKind.JsxOpeningElement) 
                                || jsxAttributes.getParentIfKind(SyntaxKind.JsxSelfClosingElement);
                    
                    if (parent) {
                        const tagName = parent.getTagNameNode().getText();
                        // Only target lowercase HTML tags (like button, span, div, a, li, etc.)
                        if (/^[a-z]/.test(tagName)) {
                            // Replace title attribute to data-tooltip-content
                            nameNode.replaceWithText("data-tooltip-content");
                            changed = true;
                        }
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
