const fs=require("fs"),path=require("path");
const out="public";
const root=".";
const toCopy=["index.html","index-js.html","styles.css","app.js","qrcode.js","manifest.json","vercel.json","assets"];
if(fs.existsSync(out)) fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});
for(const p of toCopy){
  const src=path.join(root,p);
  const dst=path.join(out,p);
  if(!fs.existsSync(src)) continue;
  if(fs.statSync(src).isDirectory()){
    fs.cpSync(src,dst,{recursive:true});
  } else {
    fs.mkdirSync(path.dirname(dst),{recursive:true});
    fs.copyFileSync(src,dst);
  }
}
console.log("Build complete -> public/ with", fs.readdirSync(out).join(", "));