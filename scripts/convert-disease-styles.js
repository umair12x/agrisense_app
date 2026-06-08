const fs = require("fs");
const path = "src/screens/DiseaseScreen.jsx";
let content = fs.readFileSync(path, "utf8");
const start = content.indexOf("const styles = StyleSheet.create({");
const end = content.lastIndexOf("});") + 3;
let stylesBlock = content.slice(start, end);
stylesBlock = stylesBlock.replace(
  "const styles = StyleSheet.create({",
  "const createDiseaseStyles = (colors) => ({"
);
const map = [
  [/backgroundColor: "#f8fafc"/g, "backgroundColor: colors.background"],
  [/backgroundColor: "#f0fdf4"/g, "backgroundColor: colors.heroGradientStart"],
  [/backgroundColor: "white"/g, "backgroundColor: colors.card"],
  [/backgroundColor: "#f1f5f9"/g, "backgroundColor: colors.chipBg"],
  [/backgroundColor: "#10b981"/g, "backgroundColor: colors.primary"],
  [/backgroundColor: "#d1fae5"/g, "backgroundColor: colors.primarySoft"],
  [/backgroundColor: "#ecfdf5"/g, "backgroundColor: colors.surfaceAlt"],
  [/backgroundColor: "#fef2f2"/g, "backgroundColor: colors.dangerSoft"],
  [/backgroundColor: "#fee2e2"/g, "backgroundColor: colors.dangerSoft"],
  [/borderColor: "#e2e8f0"/g, "borderColor: colors.border"],
  [/borderColor: "#dcfce7"/g, "borderColor: colors.border"],
  [/borderColor: "#fecaca"/g, "borderColor: colors.danger"],
  [/color: "#065f46"/g, "color: colors.primaryDark"],
  [/color: "#64748b"/g, "color: colors.textSecondary"],
  [/color: "#1e293b"/g, "color: colors.text"],
  [/color: "#334155"/g, "color: colors.text"],
  [/color: "#10b981"/g, "color: colors.primary"],
  [/color: "#991b1b"/g, "color: colors.danger"],
  [/color: "#b45309"/g, "color: colors.warning"],
  [/color: "#94a3b8"/g, "color: colors.textMuted"],
  [/color: "white"/g, "color: colors.onPrimary"],
  [/shadowColor: "#000"/g, "shadowColor: colors.shadow"],
];
for (const [re, rep] of map) {
  stylesBlock = stylesBlock.replace(re, rep);
}
fs.writeFileSync(
  "src/screens/diseaseStyles.js",
  `export ${stylesBlock}\n`
);
content = content.slice(0, start) + content.slice(end);
fs.writeFileSync(path, content);
console.log("Done");
