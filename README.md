# Zotero Alternative Reader Plugin

[![GitHub Release](https://img.shields.io/github/v/release/huangyxi/zotero-alt-reader?label=Release&logo=github)](https://github.com/huangyxi/zotero-alt-reader/releases/latest)
[![Actions](https://img.shields.io/github/actions/workflow/status/huangyxi/zotero-alt-reader/ci.yml?label=Actions&logo=github&branch=main)](https://github.com/huangyxi/zotero-alt-reader/actions/workflows/ci.yml)
![GitHub repo size](https://img.shields.io/github/repo-size/huangyxi/zotero-alt-reader)

A lightweight plugin for Zotero 9 that adds a right-click menu to open PDFs in your alternative reader (using the system default if Zotero is your primary reader, and vice versa).

### Installation

1. Download the `.xpi` file [here](https://github.com/huangyxi/zotero-alt-reader/releases/latest).
2. In Zotero, go to **Tools** > **Plugins**.
3. Drag and drop the `.xpi` file into the window, or use the gear icon to **Install Plugin From File...**.
4. (OPTIONAL) Restart Zotero.

### Usage

Select any item(s) or PDF(s) in your library, right-click, and select **Open in System Viewer** (or **Open in Zotero Reader**, depending on your default).

### Developer Notes

This plugin targets the Zotero 9 asynchronous menu architecture. It safely monkey-patches `Zotero_LocateMenu.buildContextMenu` and utilizes the `zotero-locate="true"` attribute to hook into Zotero's native UI cleanup lifecycle, completely preventing menu duplication and missing item bugs.
