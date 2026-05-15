import re

with open("src/components/player/MiniPlayer.tsx", "r") as f:
    code = f.read()

replacements = {
    'style={[styles.outerContainer, animatedStyle]}': 'className="h-[68px] bg-transparent overflow-visible z-[1000]" style={animatedStyle}',
    'style={[styles.container, { backgroundColor: colors.surface }]}': 'className="h-full shadow-md shadow-black/10 elevation-[8]" style={{ backgroundColor: colors.surface }}',
    'style={styles.touchArea}': 'className="flex-1"',
    'style={[styles.progressBar, { backgroundColor: colors.border }]}': 'className="h-[3px] relative" style={{ backgroundColor: colors.border }}',
    'style={[styles.progressFill, { width: `${displayProgress * 100}%`, backgroundColor: colors.primary }]}': 'className="h-full" style={{ width: `${displayProgress * 100}%`, backgroundColor: colors.primary }}',
    'style={[styles.progressThumb, { left: `${displayProgress * 100}%`, marginLeft: -4, backgroundColor: colors.primary }]}': 'className="absolute -top-[2.5px] w-2 h-2 rounded-full shadow-sm shadow-black/20 elevation-2" style={{ left: `${displayProgress * 100}%`, marginLeft: -4, backgroundColor: colors.primary }}',
    'style={styles.content}': 'className="flex-row items-center px-3.5 py-2.5 flex-1"',
    'style={styles.cover}': 'className="w-11 h-11 rounded-[10px] mr-3.5"',
    'style={[styles.cover, styles.placeholderCover, { backgroundColor: colors.border }]}': 'className="w-11 h-11 rounded-[10px] mr-3.5 items-center justify-center" style={{ backgroundColor: colors.border }}',
    'style={styles.info}': 'className="flex-1 mr-3"',
    'style={[styles.title, { color: colors.text }]}': 'className="text-[15px] font-bold" style={{ color: colors.text }}',
    'style={[styles.artist, { color: colors.textSecondary }]}': 'className="text-xs" style={{ color: colors.textSecondary }}',
    'style={styles.actions}': 'className="flex-row items-center gap-3"',
    'style={styles.likeBtn}': 'className="p-2 mr-1"',
    'style={styles.actionBtn}': 'className="p-0.5"',
    'style={miniVizStyles.container}': 'className="flex-row items-end gap-0.5 h-[18px] w-4 justify-center mr-2"',
    'style={[miniVizStyles.bar, { backgroundColor: color }, animatedStyle]}': 'className="w-[3px] rounded-sm" style={[{ backgroundColor: color }, animatedStyle]}',
}

for k, v in replacements.items():
    code = code.replace(k, v)

# Remove the styles blocks
code = re.sub(r'const styles = StyleSheet\.create\(\{[\s\S]*?\}\);\n', '', code)
code = re.sub(r'const miniVizStyles = StyleSheet\.create\(\{[\s\S]*?\}\);\n', '', code)
code = re.sub(r'\s*StyleSheet,?', '', code)

with open("src/components/player/MiniPlayer.tsx", "w") as f:
    f.write(code)
