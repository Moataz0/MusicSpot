import re

with open("src/components/player/MiniPlayer.tsx", "r") as f:
    code = f.read()

replacements = {
    'style={styles.outerContainer}': 'className="h-[68px] bg-transparent overflow-visible z-[1000]"',
    'style={[\\n          styles.container,\\n          { backgroundColor: colors.surface },\\n          { transform: [{ translateY }] },\\n        ]}': 'className="h-full shadow-md shadow-black/10 elevation-[8]" style={{ backgroundColor: colors.surface, transform: [{ translateY }] }}',
    'style={[\\n          styles.container,\\n          {\\n            backgroundColor: colors.surface,\\n            transform: [{ translateY }]\\n          }\\n        ]}': 'className="h-full shadow-md shadow-black/10 elevation-[8]" style={{ backgroundColor: colors.surface, transform: [{ translateY }] }}',
    'style={[styles.progressFill, animatedProgressStyle]}': 'className="h-full" style={[animatedProgressStyle, { backgroundColor: colors.primary }]}',
    'style={[\\n                styles.progressThumb,\\n                animatedThumbStyle,\\n                { backgroundColor: colors.primary },\\n              ]}': 'className="absolute -top-[2.5px] w-2 h-2 rounded-full shadow-sm shadow-black/20 elevation-2" style={[animatedThumbStyle, { backgroundColor: colors.primary }]}',
    'style={[\\n                  styles.cover,\\n                  styles.placeholderCover,\\n                  { backgroundColor: colors.border },\\n                ]}': 'className="w-11 h-11 rounded-[10px] mr-3.5 items-center justify-center" style={{ backgroundColor: colors.border }}',
}

for k, v in replacements.items():
    code = code.replace(k, v)

# Generic fallback for any remaining `styles.*`
code = re.sub(r'styles\.[a-zA-Z0-9_]+', 'null', code)

with open("src/components/player/MiniPlayer.tsx", "w") as f:
    f.write(code)
