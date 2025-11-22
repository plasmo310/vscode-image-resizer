# vscode-image-resizer

* 画像ファイルをドラッグ&ドロップでリサイズ・保存できるVSCode拡張機能です。
* できること
    * 画像ファイルを比率固定したままリサイズ・保存する
    * リサイズ情報から整形したテキストをMarkdownにペーストする

## 実行方法

* Setup
    * Execute `npm install` command.
* Debug
    * Press `F5` to open a new window with your extension loaded.

## 設定例

```
{
    ・・・略・・・
	"imageResizer.outputImageDir": "c:\\blog\\public\\content",
	"imageResizer.insertTextFormat": "![${filename}{width:${width}px}{border}](/server-contents/public/content/${filename}.png \"${filename}\")"
}
```
