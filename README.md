# Control Characters
Plugin for [Obsidian](https://obsidian.md)

![min app version](https://shields.io/github/manifest-json/minAppVersion/joethei/obsidian-control-characters?label=lowest%20supported%20app%20version)
[![libera manifesto](https://shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)
---

Show control characters in edit mode.

## Only show characters in selection

By default, the plugin will show all characters in a note.
But you can configure it to only show control characters when selecting text.

You can also overwrite this behaviour with the `cc-selection` property.

## Other invisible Unicode characters

Beyond spaces, tabs, and newlines the plugin can also detect and highlight a broad set of invisible Unicode characters — zero-width spaces, joiners, non-breaking spaces, directional marks, variation selectors, and more.

Each character is shown with a colored highlight frame. When the **Show Unicode code point labels** setting is enabled, a small badge (e.g. `U+200B`) identifies the exact code point.

A handful of characters (U+200C, U+200D, U+FE0E, U+FE0F) are displayed in red to signal that their Unicode properties prevent the cursor from being placed between them and the preceding character.

## Overwriting settings for a note

You can also change the settings for a single note, by using [Properties](https://help.obsidian.md/Editing+and+formatting/Properties).

So for example, the following note will only have the new line characters.
```md
---
cc: true
cc-tab: false
cc-newline: true
cc-space: false
cc-other: false
cc-other-labels: false
---
Quo usque tandem abutere, Catilina, patientia nostra?

Lorem ipsum dolor sit amet, consectetur adipisici elit.
```

## Customization

You can customize most of the styling with the [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) plugin.

---

Thanks to [@nothingislost](https://github.com/nothingislost) for all the reference plugins.
