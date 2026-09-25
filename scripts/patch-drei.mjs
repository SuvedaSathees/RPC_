import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

function patchFile(relPath, replacer) {
  const filePath = path.join(rootDir, relPath);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  const updated = replacer(content);
  if (updated !== content) {
    fs.writeFileSync(filePath, updated, "utf8");
    console.log(`[patch-drei] Patched ${relPath}`);
  }
}

// 1. ESM Html.js
patchFile("node_modules/@react-three/drei/web/Html.js", (content) => {
  if (content.includes("r.unmount()")) return content;
  return content.replace(
    /React\.useLayoutEffect\(\(\) => \{\s*if \(group\.current\) \{\s*const currentRoot = root\.current = ReactDOM\.createRoot\(el\);[\s\S]*?return \(\) => \{\s*if \(target\) target\.removeChild\(el\);\s*currentRoot\.unmount\(\);\s*\};\s*\}\s*\}, \[target, transform\]\);/,
    `React.useEffect(() => {
    return () => {
      if (root.current) {
        const r = root.current;
        root.current = null;
        setTimeout(() => {
          try {
            r.unmount();
          } catch {}
        }, 0);
      }
    };
  }, []);
  React.useLayoutEffect(() => {
    if (group.current) {
      if (!root.current) {
        root.current = ReactDOM.createRoot(el);
      }
      scene.updateMatrixWorld();
      if (transform) {
        el.style.cssText = \`position:absolute;top:0;left:0;pointer-events:none;overflow:hidden;\`;
      } else {
        const vec = calculatePosition(group.current, camera, size);
        el.style.cssText = \`position:absolute;top:0;left:0;transform:translate3d(\${vec[0]}px,\${vec[1]}px,0);transform-origin:0 0;\`;
      }
      if (target) {
        if (prepend) target.prepend(el);else target.appendChild(el);
      }
      return () => {
        if (target) {
          try {
            target.removeChild(el);
          } catch {}
        }
      };
    }
  }, [target, transform]);`
  );
});

// 2. CJS Html.cjs.js
patchFile("node_modules/@react-three/drei/web/Html.cjs.js", (content) => {
  if (content.includes("G.current=null")) return content;
  return content.replace(
    /c\.useLayoutEffect\(\(\(\)=>\{if\(Z\.current\)\{const e=G\.current=l\.createRoot\(D\);if\(N\.updateMatrixWorld\(\),w\)D\.style\.cssText="position:absolute;top:0;left:0;pointer-events:none;overflow:hidden;";else\{const e=R\(Z\.current,H,V\);D\.style\.cssText=`position:absolute;top:0;left:0;transform:translate3d\(\$\{e\[0\]\}px,\$\{e\[1\]\}px,0\);transform-origin:0 0;`\}return U&&\(s\?U\.prepend\(D\):U\.appendChild\(D\)\),\(\)=>\{U&&U\.removeChild\(D\),e\.unmount\(\)\}\}\}\),\[U,w\]\)/,
    `c.useEffect((()=>()=>{if(G.current){const e=G.current;G.current=null,setTimeout((()=>{try{e.unmount()}catch{}}),0)}}),[]),c.useLayoutEffect((()=>{if(Z.current){G.current||(G.current=l.createRoot(D));if(N.updateMatrixWorld(),w)D.style.cssText="position:absolute;top:0;left:0;pointer-events:none;overflow:hidden;";else{const e=R(Z.current,H,V);D.style.cssText=\`position:absolute;top:0;left:0;transform:translate3d(\${e[0]}px,\${e[1]}px,0);transform-origin:0 0;\`}return U&&(s?U.prepend(D):U.appendChild(D)),()=>{try{U&&U.removeChild(D)}catch{}}}}),[U,w])`
  );
});
