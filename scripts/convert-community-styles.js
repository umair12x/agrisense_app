const fs = require("fs");
const path = "src/screens/CommunityScreen.jsx";
let content = fs.readFileSync(path, "utf8");
const start = content.indexOf("const styles = StyleSheet.create({");
const end = content.indexOf("});", start) + 3;
let stylesBlock = content.slice(start, end);
stylesBlock = stylesBlock.replace(
  "const styles = StyleSheet.create({",
  "const createCommunityStyles = (colors) => ({"
);
const map = [
  [/backgroundColor: "#f8fafc"/g, "backgroundColor: colors.background"],
  [/backgroundColor: "#fafbfc"/g, "backgroundColor: colors.background"],
  [/backgroundColor: "white"/g, "backgroundColor: colors.card"],
  [/backgroundColor: "#f1f5f9"/g, "backgroundColor: colors.chipBg"],
  [/backgroundColor: "#10b981"/g, "backgroundColor: colors.primary"],
  [/backgroundColor: "#d1fae5"/g, "backgroundColor: colors.primarySoft"],
  [/backgroundColor: "#1e293b"/g, "backgroundColor: colors.videoBg"],
  [/backgroundColor: "#3b82f6"/g, "backgroundColor: colors.link"],
  [/backgroundColor: "#ef4444"/g, "backgroundColor: colors.danger"],
  [/backgroundColor: "#fef2f2"/g, "backgroundColor: colors.dangerSoft"],
  [/borderColor: "#e2e8f0"/g, "borderColor: colors.border"],
  [/borderColor: "white"/g, "borderColor: colors.card"],
  [/borderTopColor: "#f1f5f9"/g, "borderTopColor: colors.border"],
  [/color: "#065f46"/g, "color: colors.primaryDark"],
  [/color: "#475569"/g, "color: colors.textSecondary"],
  [/color: "#64748b"/g, "color: colors.textSecondary"],
  [/color: "#1e293b"/g, "color: colors.text"],
  [/color: "#334155"/g, "color: colors.text"],
  [/color: "#10b981"/g, "color: colors.primary"],
  [/color: "#ef4444"/g, "color: colors.danger"],
  [/color: "#94a3b8"/g, "color: colors.textMuted"],
  [/color: "#cbd5e1"/g, "color: colors.textMuted"],
  [/color: "white"/g, "color: colors.onPrimary"],
  [/shadowColor: "#000"/g, "shadowColor: colors.shadow"],
];
for (const [re, rep] of map) {
  stylesBlock = stylesBlock.replace(re, rep);
}
fs.writeFileSync(
  "src/screens/communityStyles.js",
  `export ${stylesBlock}\n`
);
content = content.slice(0, start) + content.slice(end);
fs.writeFileSync(path, content);
console.log("Done");
