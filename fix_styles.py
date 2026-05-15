import re

with open("src/screens/library/LibraryScreen.tsx", "r") as f:
    code = f.read()

# Instead of string replacement, I will replace `styles.X` with `undefined` or just remove it.
# Actually, since the styling is supposed to be done using NativeWind classes, and we've removed styles definition,
# the remaining `styles.X` are breaking TS.
# Let's replace any `styles.[a-zA-Z0-9_]+` with an empty object `{}` inside an array, or just remove them.
# The safest way is to replace `styles.[a-zA-Z0-9_]+` with `null` so TS doesn't complain, and the style prop just ignores it.
# Wait, `style={[null, ...]}` is valid React Native.

# Let's see what remains:
remaining_styles = set(re.findall(r'styles\.([a-zA-Z0-9_]+)', code))

for s in remaining_styles:
    print(f"Replacing styles.{s}")
    code = re.sub(r'styles\.' + s, 'null', code)

with open("src/screens/library/LibraryScreen.tsx", "w") as f:
    f.write(code)
