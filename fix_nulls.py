with open("src/screens/library/LibraryScreen.tsx", "r") as f:
    code = f.read()

code = code.replace("nullArtist", "null")
code = code.replace("nullText", "null")
code = code.replace("nullName", "null")
code = code.replace("nullCount", "null")

with open("src/screens/library/LibraryScreen.tsx", "w") as f:
    f.write(code)
