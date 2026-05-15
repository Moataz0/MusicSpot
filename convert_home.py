import re

with open("src/screens/home/HomeScreen.tsx", "r") as f:
    code = f.read()

replacements = {
    'style={[styles.container, { backgroundColor: colors.background }]}': 'className="flex-1" style={{ backgroundColor: colors.background }}',
    'style={styles.tabContainer}': 'className="flex-row px-6 mb-4 gap-3 items-center"',
    'style={[\\n                styles.tab,\\n                { backgroundColor: colors.surface },\\n                activeTab === tab && { backgroundColor: colors.primary },\\n              ]}': 'className={`py-2 px-4 rounded-[20px] ${activeTab === tab ? "" : ""}`} style={{ backgroundColor: activeTab === tab ? colors.primary : colors.surface }}',
    'style={[\\n                  styles.tabText,\\n                  { color: colors.textSecondary },\\n                  activeTab === tab && { color: colors.background },\\n                ]}': 'className="text-base font-semibold" style={{ color: activeTab === tab ? colors.background : colors.textSecondary }}',
    'style={[styles.scrollContent, { paddingBottom: 180 }]}': 'className="flex-grow gap-3" style={{ paddingBottom: 180 }}',
    'style={styles.loader}': 'className="mt-16"',
    'style={[styles.sectionTitle, { color: colors.text }]}': 'className="flex-1 px-6 mb-4 text-2xl font-bold" style={{ color: colors.text }}',
    'style={isGridView ? styles.gridContainer : null}': 'className={isGridView ? "flex-row flex-wrap gap-4 justify-between px-6" : ""}',
    'style={styles.horizontalList}': 'className="px-6"',
    'style={styles.spacer}': 'className="h-8"',
    'style={styles.localHeader}': 'className="flex-row justify-between items-center mb-6 px-6"',
    'style={styles.localTitleRow}': 'className="flex-row items-center gap-3 flex-1"',
    'style={styles.backButton}': 'className="flex-row items-center gap-2 mb-4"',
    'style={[styles.backText, { color: colors.primary }]}': 'className="text-base font-bold" style={{ color: colors.primary }}',
    'style={styles.folderSection}': 'className="mb-6"',
    'style={styles.sectionHeaderRow}': 'className="flex-row justify-between items-center px-6 mb-3"',
    'style={[styles.subTitle, { color: colors.text }]}': 'className="text-xl font-bold flex-1 mr-3" style={{ color: colors.text }}',
    'style={[styles.seeAllText, { color: colors.primary }]}': 'className="text-base font-bold" style={{ color: colors.primary }}',
    'style={styles.folderList}': 'className="px-6"',
    'style={styles.folderCard}': 'className="w-[120px] mr-4"',
    'style={[\\n                          styles.folderImage,\\n                          {\\n                            backgroundColor: colors.surface,\\n                            borderColor: colors.border,\\n                            justifyContent: "center",\\n                            alignItems: "center",\\n                          },\\n                        ]}': 'className="w-[120px] h-[120px] rounded-2xl border mb-2 overflow-hidden items-center justify-center" style={{ backgroundColor: colors.surface, borderColor: colors.border }}',
    'style={[\\n                            styles.badge,\\n                            { backgroundColor: colors.primary },\\n                          ]}': 'className="absolute top-2 right-2 rounded-[10px] min-w-[20px] h-5 px-1.5 justify-center items-center" style={{ backgroundColor: colors.primary }}',
    'style={[\\n                              styles.badgeText,\\n                              { color: colors.background },\\n                            ]}': 'className="text-[10px] font-bold" style={{ color: colors.background }}',
    'style={[styles.folderTitle, { color: colors.text }]}': 'className="text-xs text-center" style={{ color: colors.text }}',
    'style={styles.headerTitle}': 'className="flex-row justify-between items-center px-4 w-full"',
    'style={styles.playAllRow}': 'className="flex-shrink-0"',
    'style={[\\n                      styles.playAllBtn,\\n                      { backgroundColor: colors.primary },\\n                    ]}': 'className="flex-row items-center py-2 px-4 rounded-[20px] gap-2" style={{ backgroundColor: colors.primary }}',
    'style={[styles.playAllText, { color: "white" }]}': 'className="text-base font-bold" style={{ color: "white" }}',
    'style={styles.emptyContainer}': 'className="items-center mt-16"',
    'style={[\\n                    styles.emptyText,\\n                    { color: colors.textSecondary, marginTop: 16 },\\n                  ]}': 'className="text-base mt-4" style={{ color: colors.textSecondary }}',
    'style={[styles.loadMoreBtn, { borderColor: colors.primary }]}': 'className="py-3 px-6 rounded-2xl border flex-row justify-center items-center my-6 mx-auto w-[80%]" style={{ borderColor: colors.primary }}',
    'style={[styles.loadMoreText, { color: colors.primary }]}': 'className="text-base font-bold" style={{ color: colors.primary }}',
    'style={[styles.emptyText, { color: colors.textSecondary }]}': 'className="text-base mt-4" style={{ color: colors.textSecondary }}',
    'style={[styles.refreshBtn, { backgroundColor: colors.primary }]}': 'className="flex-row items-center py-3 px-6 rounded-[20px] gap-2 mt-6 shadow-md" style={{ backgroundColor: colors.primary }}',
    'style={styles.refreshBtnText}': 'className="text-white text-base font-bold"',
}

for k, v in replacements.items():
    code = code.replace(k, v)

# Generic fallback
code = re.sub(r'styles\.[a-zA-Z0-9_]+', 'null', code)

code = re.sub(r'const styles = StyleSheet\.create\(\{[\s\S]*?\}\);\n', '', code)
code = re.sub(r'\s*StyleSheet,?', '', code)

with open("src/screens/home/HomeScreen.tsx", "w") as f:
    f.write(code)
