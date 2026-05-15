import re

# Class mappings
mapping = {
    "container": "flex-1",
    "content": "px-6 pb-[140px]",
    "title": "text-2xl font-bold",
    "topActionsRow": "flex-row items-center px-6 pt-3 pb-2 gap-3",
    "navBarActions": "flex-row items-center gap-2",
    "titleRow": "px-6 pb-4",
    "navSearchContainer": "flex-1 flex-row items-center h-10 rounded-full px-3 border",
    "navSearchInput": "flex-1 ml-2 text-sm py-0",
    "gridToggleButton": "w-9 h-9 justify-center items-center",
    "tabBarContainer": "border-b mb-2",
    "tabBar": "px-6 flex-row gap-6",
    "tabItem": "py-3 px-1",
    "tabText": "text-base",
    "playlistCard": "p-3 rounded-2xl border mb-3 flex-row items-center justify-between",
    "gridPlaylistCard": "w-[48%] flex-col items-center p-4 text-center mb-4",
    "playlistContent": "flex-row items-center flex-1 gap-4",
    "gridPlaylistContent": "flex-col items-center gap-3",
    "playlistArt": "w-12 h-12 rounded-lg justify-center items-center overflow-hidden",
    "playlistInfo": "flex-1",
    "gridPlaylistInfo": "items-center w-full",
    "playlistName": "text-base font-semibold",
    "playlistCount": "text-xs",
    "backToPlaylists": "flex-row items-center gap-2 mb-4",
    "backToPlaylistsText": "text-sm font-bold",
    "selectedPlaylistTitle": "text-2xl font-bold mb-4",
    "modalOverlay": "flex-1 bg-black/70 justify-center p-8",
    "modalContent": "rounded-3xl p-6",
    "modalTitle": "text-2xl font-bold mb-6 text-center",
    "input": "rounded-xl p-4 mb-6 text-sm",
    "modalButtons": "flex-row justify-between items-center gap-2 min-h-[48px]",
    "modalLoadingContainer": "flex-1 items-center justify-center h-12",
    "modalBtn": "py-3 px-6",
    "saveBtn": "rounded-xl",
    "cancelText": "text-sm",
    "saveBtnText": "text-sm font-bold",
    "deleteModalContent": "items-center pt-8",
    "warningIconContainer": "w-20 h-20 rounded-full justify-center items-center mb-5",
    "deleteText": "text-sm text-center mb-8 leading-6 px-2.5",
    "confirmDeleteBtn": "bg-[#f36a6a] rounded-xl px-6",
    "confirmDeleteText": "text-sm text-white font-bold",
    "createPlaylistRow": "flex-row items-center p-4 rounded-2xl border mb-5 gap-4",
    "createIconContainer": "w-11 h-11 rounded-full justify-center items-center",
    "createText": "text-base font-semibold",
    "gridTrack": "w-[48%] mb-5 items-center",
    "gridTrackImage": "w-full aspect-square rounded-2xl justify-center items-center overflow-hidden border pb-20",
    "gridImage": "w-full h-full",
    "gridPlayingOverlay": "absolute inset-0 justify-center items-center z-10",
    "gridTrackTitle": "text-sm font-semibold w-full",
    "gridTrackArtist": "text-xs mt-0.5 w-full",
    "gridCardOverlay": "absolute bottom-0 left-0 right-0 h-full rounded-2xl",
    "gridCardInfo": "absolute bottom-0 left-0 right-0 p-3 items-center justify-end rounded-2xl",
    "gridActionsBottom": "flex-row justify-center items-center gap-4 mt-2",
    "actionIconBottom": "p-1",
    "gridMoreButton": "p-1 mt-1",
    "gridWrapper": "justify-between px-1",
    "emptyText": "text-sm text-center mt-10",
    "editModeBtn": "flex-row items-center px-3 py-1.5 rounded-full gap-1",
    "editModeText": "text-sm font-semibold",
    "viewModeBtn": "w-10 h-10 rounded-full justify-center items-center",
    "sortBtn": "p-2",
    "folderIcon": "w-12 h-12 rounded-lg justify-center items-center",
    "folderInfo": "flex-1",
    "folderName": "text-base font-semibold",
    "folderCount": "text-xs",
}

with open("src/screens/library/LibraryScreen.tsx", "r") as f:
    code = f.read()

# 1. Replace contentContainerStyle={styles.X} -> contentContainerStyle={{ ... }} No, better change to contentContainerClassName="X" if using NativeWind. But flashlist might not support contentContainerClassName. Let's just do classNames for standard components. Wait, FlashList doesn't support className. So for contentContainerStyle we need to keep it inline or replace with padding.
# Wait, for FlashList, it's safer to keep `contentContainerStyle={{ padding: 24, paddingBottom: 140 }}`

code = code.replace('contentContainerStyle={styles.content}', 'contentContainerStyle={{ padding: 24, paddingBottom: 140 }}')
code = code.replace('contentContainerStyle={styles.tabBar}', 'contentContainerStyle={{ paddingHorizontal: 24, flexDirection: "row", gap: 24 }}')

# Helper to process `style={...}` attributes
def replace_style(match):
    style_content = match.group(1)
    
    # Extract styles.*
    style_names = re.findall(r'styles\.([a-zA-Z0-9_]+)', style_content)
    
    classes = []
    for s in style_names:
        if s in mapping:
            classes.append(mapping[s])
    
    class_str = " ".join(classes)
    
    # Remove styles.* from style_content
    new_style_content = re.sub(r'styles\.[a-zA-Z0-9_]+', '', style_content)
    # Cleanup empty arrays, commas etc
    new_style_content = re.sub(r'\[\s*,', '[', new_style_content)
    new_style_content = re.sub(r',\s*,', ',', new_style_content)
    new_style_content = re.sub(r',\s*\]', ']', new_style_content)
    new_style_content = re.sub(r'\[\s*\]', '', new_style_content)
    
    # Handle conditional styles like `isActive && { ... }` or `isGridView && styles.grid`
    # It's better to manually do className=... and keep style={...} if needed
    
    res = ''
    if class_str:
        # If there are conditional classes, we need to handle them!
        # This regex might be too simple, so let's try a different approach.
        res += f' className="{class_str}"'
    
    # We will just write the script to do exact string replacements for the most common ones
    return match.group(0)

# Instead of regex, let's just do brute force exact string replacements for common lines
replacements = {
    'style={[styles.container, { backgroundColor: colors.background }]}': 'className="flex-1" style={{ backgroundColor: colors.background }}',
    'style={styles.topActionsRow}': 'className="flex-row items-center px-6 pt-3 pb-2 gap-3"',
    'style={[styles.navSearchContainer, { backgroundColor: colors.surface, borderColor: colors.border + "30" }]}': 'className="flex-1 flex-row items-center h-10 rounded-full px-3 border" style={{ backgroundColor: colors.surface, borderColor: colors.border + "30" }}',
    'style={[styles.navSearchInput, { color: colors.text }]}': 'className="flex-1 ml-2 text-sm py-0" style={{ color: colors.text }}',
    'style={styles.navBarActions}': 'className="flex-row items-center gap-2"',
    'style={[styles.viewModeBtn, { backgroundColor: colors.surface }]}': 'className="w-10 h-10 rounded-full justify-center items-center" style={{ backgroundColor: colors.surface }}',
    'style={styles.titleRow}': 'className="px-6 pb-4"',
    'style={[styles.title, { color: colors.text }]}': 'className="text-2xl font-bold" style={{ color: colors.text }}',
    'style={[styles.tabBarContainer, { borderBottomColor: colors.border + "15" }]}': 'className="border-b mb-2" style={{ borderBottomColor: colors.border + "15" }}',
    'style={[styles.tabItem, isActive && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}': 'className="py-3 px-1" style={isActive ? { borderBottomColor: colors.primary, borderBottomWidth: 2 } : {}}',
    'style={[styles.tabText, { color: isActive ? colors.primary : colors.textSecondary }, isActive && { fontWeight: "bold" }]}': 'className={`text-base ${isActive ? "font-bold" : ""}`} style={{ color: isActive ? colors.primary : colors.textSecondary }}',
    'style={styles.emptyText}': 'className="text-sm text-center mt-10"',
    'style={[styles.emptyText, { color: colors.textSecondary }]}': 'className="text-sm text-center mt-10" style={{ color: colors.textSecondary }}',
    'style={styles.backToPlaylists}': 'className="flex-row items-center gap-2 mb-4"',
    'style={[styles.backToPlaylistsText, { color: colors.primary }]}': 'className="text-sm font-bold" style={{ color: colors.primary }}',
    'style={[styles.selectedPlaylistTitle, { color: colors.text }]}': 'className="text-2xl font-bold mb-4" style={{ color: colors.text }}',
    'style={isGridView ? styles.gridTrack : styles.playlistCard}': 'className={isGridView ? "w-[48%] mb-5 items-center" : "p-3 rounded-2xl border mb-3 flex-row items-center justify-between"}',
    'style={isGridView ? [styles.gridTrackImage, { backgroundColor: colors.surface }] : [styles.playlistArt, { backgroundColor: colors.background, borderRadius: 25 }]}': 'className={isGridView ? "w-full aspect-square rounded-2xl justify-center items-center overflow-hidden border pb-20" : "w-12 h-12 rounded-lg justify-center items-center overflow-hidden"} style={isGridView ? { backgroundColor: colors.surface } : { backgroundColor: colors.background, borderRadius: 25 }}',
    'style={styles.gridCardOverlay}': 'className="absolute bottom-0 left-0 right-0 h-full rounded-2xl"',
    'style={styles.gridCardInfo}': 'className="absolute bottom-0 left-0 right-0 p-3 items-center justify-end rounded-2xl"',
    'style={[styles.gridTrackTitle, { color: "white", textAlign: "center" }]}': 'className="text-sm font-semibold w-full" style={{ color: "white", textAlign: "center" }}',
    'style={[styles.gridTrackArtist, { color: "rgba(255,255,255,0.7)", textAlign: "center" }]}': 'className="text-xs mt-0.5 w-full" style={{ color: "rgba(255,255,255,0.7)", textAlign: "center" }}',
    'style={styles.playlistInfo}': 'className="flex-1"',
    'style={[styles.playlistName, { color: colors.text }]}': 'className="text-base font-semibold" style={{ color: colors.text }}',
    'style={styles.playlistCount}': 'className="text-xs"',
    'style={isGridView ? [styles.gridTrackImage, { backgroundColor: colors.surface }] : [styles.playlistArt, { backgroundColor: colors.background }]}': 'className={isGridView ? "w-full aspect-square rounded-2xl justify-center items-center overflow-hidden border pb-20" : "w-12 h-12 rounded-lg justify-center items-center overflow-hidden"} style={isGridView ? { backgroundColor: colors.surface } : { backgroundColor: colors.background }}',
    'style={styles.gridTrack}': 'className="w-[48%] mb-5 items-center"',
    'style={[styles.gridTrackImage, { backgroundColor: colors.surface, borderColor: colors.border }]}': 'className="w-full aspect-square rounded-2xl justify-center items-center overflow-hidden border pb-20" style={{ backgroundColor: colors.surface, borderColor: colors.border }}',
    'style={styles.gridImage}': 'className="w-full h-full"',
    'style={styles.gridActionsBottom}': 'className="flex-row justify-center items-center gap-4 mt-2"',
    'style={styles.actionIconBottom}': 'className="p-1"',
    'style={[styles.createPlaylistRow, { backgroundColor: colors.surface, borderColor: colors.border }]}': 'className="flex-row items-center p-4 rounded-2xl border mb-5 gap-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }}',
    'style={[styles.createIconContainer, { backgroundColor: colors.primary + "20" }]}': 'className="w-11 h-11 rounded-full justify-center items-center" style={{ backgroundColor: colors.primary + "20" }}',
    'style={[styles.createText, { color: colors.text }]}': 'className="text-base font-semibold" style={{ color: colors.text }}',
    'style={[styles.playlistCard, isGridView && styles.gridPlaylistCard, { backgroundColor: colors.surface, borderColor: colors.border }]}': 'className={`p-3 rounded-2xl border mb-3 flex-row items-center justify-between ${isGridView ? "w-[48%] flex-col items-center p-4 text-center mb-4" : ""}`} style={{ backgroundColor: colors.surface, borderColor: colors.border }}',
    'style={[styles.playlistContent, isGridView && styles.gridPlaylistContent]}': 'className={`flex-row items-center flex-1 gap-4 ${isGridView ? "flex-col items-center gap-3" : ""}`}',
    'style={[styles.folderIcon, { backgroundColor: colors.background }]}': 'className="w-12 h-12 rounded-lg justify-center items-center" style={{ backgroundColor: colors.background }}',
    'style={[styles.folderInfo, isGridView && styles.gridPlaylistInfo]}': 'className={`flex-1 ${isGridView ? "items-center w-full" : ""}`}',
    'style={[styles.folderName, { color: colors.text, textAlign: isGridView ? "center" : "left" }]}': 'className="text-base font-semibold" style={{ color: colors.text, textAlign: isGridView ? "center" : "left" }}',
    'style={[styles.folderCount, { color: colors.textSecondary, textAlign: isGridView ? "center" : "left" }]}': 'className="text-xs" style={{ color: colors.textSecondary, textAlign: isGridView ? "center" : "left" }}',
    'style={styles.modalOverlay}': 'className="flex-1 bg-black/70 justify-center p-8"',
    'style={[styles.modalContent, { backgroundColor: colors.surface }]}': 'className="rounded-3xl p-6" style={{ backgroundColor: colors.surface }}',
    'style={[styles.modalTitle, { color: colors.text }]}': 'className="text-2xl font-bold mb-6 text-center" style={{ color: colors.text }}',
    'style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}': 'className="rounded-xl p-4 mb-6 text-sm" style={{ backgroundColor: colors.background, color: colors.text }}',
    'style={styles.modalButtons}': 'className="flex-row justify-between items-center gap-2 min-h-[48px]"',
    'style={styles.modalLoadingContainer}': 'className="flex-1 items-center justify-center h-12"',
    'style={styles.modalBtn}': 'className="py-3 px-6"',
    'style={[styles.cancelText, { color: colors.textSecondary }]}': 'className="text-sm" style={{ color: colors.textSecondary }}',
    'style={[styles.modalBtn, styles.saveBtn, { backgroundColor: colors.primary }]}': 'className="py-3 px-6 rounded-xl" style={{ backgroundColor: colors.primary }}',
    'style={[styles.saveBtnText, { color: colors.background }]}': 'className="text-sm font-bold" style={{ color: colors.background }}',
    'style={[styles.modalContent, styles.deleteModalContent, { backgroundColor: colors.surface }]}': 'className="rounded-3xl p-6 items-center pt-8" style={{ backgroundColor: colors.surface }}',
    'style={[styles.warningIconContainer, { backgroundColor: "#FF444420" }]}': 'className="w-20 h-20 rounded-full justify-center items-center mb-5" style={{ backgroundColor: "#FF444420" }}',
    'style={[styles.modalTitle, { color: colors.text, marginBottom: 8 }]}': 'className="text-2xl font-bold mb-2 text-center" style={{ color: colors.text }}',
    'style={[styles.deleteText, { color: colors.textSecondary }]}': 'className="text-sm text-center mb-8 leading-6 px-2.5" style={{ color: colors.textSecondary }}',
    'style={[styles.modalBtn, styles.confirmDeleteBtn]}': 'className="py-3 px-6 bg-[#f36a6a] rounded-xl"',
    'style={styles.confirmDeleteText}': 'className="text-sm text-white font-bold"',
}

for k, v in replacements.items():
    code = code.replace(k, v)

# Remove the styles block
code = re.sub(r'const styles = StyleSheet\.create\(\{[\s\S]*\}\);\n', '', code)

# Remove StyleSheet import
code = re.sub(r'\s*StyleSheet,', '', code)

with open("src/screens/library/LibraryScreen.tsx", "w") as f:
    f.write(code)

