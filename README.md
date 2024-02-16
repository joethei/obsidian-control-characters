# Control Characters
Plugin for [Obsidian](https://obsidian.md)

![Maintenance](https://shields.io:/maintenance/yes/2024)
![min app version](https://shields.io/github/manifest-json/minAppVersion/joethei/obsidian-control-characters?label=lowest%20supported%20app%20version)
[![libera manifesto](https://shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)
---

Show control characters in edit mode.

![Demo screenshot](https://i.joethei.space/Obsidian_136foBrkZM.png)

## Only show characters in selection

By default, the plugin will show all characters in a note.
But you can configure it to only show control characters when selecting text.

You can also overwrite this behaviour in the frontmatter with the `cc-selection` key.

## Overwriting settings for a note

You can also change the settings for a single note, by using the [Frontmatter](https://help.obsidian.md/Advanced+topics/YAML+front+matter).

So for example, the following note will only have the new line characters.
```yaml
---
cc: true
cc-tab: false
cc-newline: true
cc-space: false
---
Quo usque tandem abutere, Catilina, patientia nostra?

Lorem ipsum dolor sit amet, consectetur adipisici elit.
```

## Customization

You can customize most of the styling with the [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) plugin.

---

This plugin is built for the new editor and does not work on the old _legacy_ editor.
If you really want to use the legacy editor you will have to use the [Show whitespace](https://github.com/deathau/cm-show-whitespace-obsidian) plugin.

---

Thanks to [@nothingislost](https://github.com/nothingislost) for all the reference plugins.
