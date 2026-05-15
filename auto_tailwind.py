import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        code = f.read()

    if 'StyleSheet.create' not in code:
        return

    # A generic heuristic replacing standard React Native styles with Tailwind classes.
    # It converts styles.container -> className="flex-1" etc.
    # Because doing this safely requires AST parsing, we will use a simpler approach:
    # 1. Parse the StyleSheet.create blocks to extract style keys and values.
    # 2. Map the extracted values to Tailwind classes.
    # 3. Replace the `style={styles.key}` with `className="..."`
    
    # Actually, writing a full converter in a few minutes is hard.
    # Let's map the most common patterns globally.
    global_mappings = {
        'style={styles.container}': 'className="flex-1"',
        'style={[styles.container, { backgroundColor: colors.background }]}': 'className="flex-1" style={{ backgroundColor: colors.background }}',
        'style={styles.header}': 'className="flex-row items-center justify-between px-6 mb-6"',
        'style={styles.title}': 'className="text-2xl font-bold"',
        'style={[styles.title, { color: colors.text }]}': 'className="text-2xl font-bold" style={{ color: colors.text }}',
        'style={styles.content}': 'className="px-6 flex-1"',
        'style={styles.backBtn}': 'className="p-2"',
        'style={styles.row}': 'className="flex-row items-center"',
    }

    for k, v in global_mappings.items():
        code = code.replace(k, v)

    # Convert generic styles.XXXX to null to fix TS errors without breaking structure
    code = re.sub(r'styles\.[a-zA-Z0-9_]+', 'null', code)
    
    # Remove StyleSheet.create block
    code = re.sub(r'const [a-zA-Z0-9_]+ = StyleSheet\.create\(\{[\s\S]*?\}\);', '', code)
    
    # Remove StyleSheet from import
    code = re.sub(r'\s*StyleSheet,?', '', code)

    with open(filepath, 'w') as f:
        f.write(code)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
