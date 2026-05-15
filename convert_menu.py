import re

with open("src/screens/shared/MenuScreen.tsx", "r") as f:
    code = f.read()

replacements = {
    'style={[styles.container, { backgroundColor: colors.background }]}': 'className="flex-1" style={{ backgroundColor: colors.background }}',
    'style={styles.backdrop}': 'className="absolute inset-0 bg-black"',
    'style={[styles.contentContainer, { backgroundColor: colors.surface }]}': 'className="absolute bottom-0 w-full rounded-t-3xl pb-10 shadow-lg" style={{ backgroundColor: colors.surface }}',
    'style={styles.header}': 'className="p-5 flex-row items-center border-b border-white/5"',
    'style={styles.coverImage}': 'className="w-14 h-14 rounded-xl mr-4"',
    'style={[styles.coverImage, styles.placeholderCover, { backgroundColor: colors.background }]}': 'className="w-14 h-14 rounded-xl mr-4 items-center justify-center" style={{ backgroundColor: colors.background }}',
    'style={styles.headerInfo}': 'className="flex-1 mr-4"',
    'style={[styles.title, { color: colors.text }]}': 'className="text-lg font-bold mb-1" style={{ color: colors.text }}',
    'style={[styles.artist, { color: colors.textSecondary }]}': 'className="text-sm" style={{ color: colors.textSecondary }}',
    'style={styles.closeBtn}': 'className="w-8 h-8 rounded-full items-center justify-center bg-white/10"',
    'style={styles.menuItems}': 'className="px-5 pt-4"',
    'style={styles.menuItem}': 'className="flex-row items-center py-4"',
    'style={[styles.iconContainer, { backgroundColor: colors.background }]}': 'className="w-10 h-10 rounded-full items-center justify-center mr-4" style={{ backgroundColor: colors.background }}',
    'style={[styles.menuItemText, { color: colors.text }]}': 'className="text-base font-semibold" style={{ color: colors.text }}',
    'style={[styles.menuItemText, styles.dangerText]}': 'className="text-base font-semibold text-[#FF4444]"',
}

for k, v in replacements.items():
    code = code.replace(k, v)

# Generic fallback
code = re.sub(r'styles\.[a-zA-Z0-9_]+', 'null', code)

code = re.sub(r'const styles = StyleSheet\.create\(\{[\s\S]*?\}\);\n', '', code)
code = re.sub(r'\s*StyleSheet,?', '', code)

with open("src/screens/shared/MenuScreen.tsx", "w") as f:
    f.write(code)
