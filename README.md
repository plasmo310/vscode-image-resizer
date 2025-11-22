# vscode-image-resizer

* 画像ファイルをドラッグ&ドロップでリサイズ・保存できるVSCode拡張機能です。
* できること
    * 画像ファイルを比率固定したままリサイズ・保存する
    * リサイズ情報から整形したテキストをMarkdownにペーストする

## 使用方法

1. `.vscode/settings.json` 内にツール用の設定を行います。
    | 項目名 | 内容 |
    | -- | -- |
    | imageResizer.outputImageDir | 画像ファイルの出力フォルダパス |
    | imageResizer.insertTextFormat | 挿入テキストのフォーマット<br>以下の文字列は内部で変換されます。<br>${filename}: ファイル名<br>\${width}: 画像幅`920、800、600、480、360`の中からリサイズ後の幅に近い値が設定されます。 |
        a. 設定例
            ```
            {
                ・・・略・・・
                "imageResizer.outputImageDir": "c:\\blog\\public\\content",
                "imageResizer.insertTextFormat": "![${filename}{width:${width}px}](/content/${filename}.png \"${filename}\")"
            }
            ```
2. 画像ファイルを Shiftキーを押下した状態でMarkdown上にドラッグ&ドロップします。
3. メッセージ内容に沿って横幅を入力します。
4. 入力した横幅から画像比率を保持した状態でリサイズ・保存されます。
5. 設定した挿入フォーマットテキストがMarkdownにペーストされます。

## 開発方法

* 初回セットアップ
    * `npm install` コマンドを実行してください。
* デバッグ方法
    * VSCode上で `F5` キーを押下してデバッグ実行できます。
