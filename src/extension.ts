import * as vscode from 'vscode';
import * as path from "path";
import { ImageHelper } from './helper/image-helper';


/**
 * フォーマット文字列に対して変数を展開する
 * @param format フォーマット文字列
 * @param vars 変数マップ
 * @returns 展開後の文字列
 */
function expandTemplate(format: string, vars: Record<string, string>): string {
	return format.replace(/\$\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}

/**
 * 挿入テキスト用の幅を取得する
 * 実際の画像サイズより少し小さめの値に調整する
 * @param width 元の幅
 * @returns 挿入テキスト用の幅
 */
function getInsertTextWidth(width: number): number {
	// 入力以下の最大値を返却する
	const WIDTH_SETTINGS = [
		360,
		480,
		600,
		800,
		920
	]
	const candidates = WIDTH_SETTINGS.filter(w => w <= width);
	if (candidates.length === 0) {
		// 該当なし → 入力値そのまま
		return width;
	}
	return Math.max(...candidates);
}

/**
 * アクティベート時処理
 * @param context 
 */
export function activate(context: vscode.ExtensionContext) {

	const provider: vscode.DocumentDropEditProvider = {
		async provideDocumentDropEdits(document, _position, dataTransfer, _token) {

			// 設定の取得
			const config = vscode.workspace.getConfiguration("imageResizer");
			const outputImageDir = config.get<string>("outputImageDir");
			const insertTextFormat = config.get<string>("insertTextFormat");
			if (!outputImageDir) {
				vscode.window.showErrorMessage("出力先フォルダ 'imageResizer.outputImageDir' を設定してください。");
				return;
			}
			if (!insertTextFormat) {
				vscode.window.showErrorMessage("挿入テキスト形式 'imageResizer.insertTextFormat' を設定してください。");
				return;
			}

			// D&Dされたファイルを抽出
			const files: vscode.DataTransferFile[] = [];
			dataTransfer.forEach((item) => {
				const f = item.asFile?.();
				if (f) files.push(f);
			});
			if (files.length === 0) {
				return;
			}

			// 1つ目の画像ファイルを処理対象とする
			const file = files[0];
			if (!file || !file.uri) {
				return;
			}
			const extname = path.extname(file.uri.fsPath || "").toLowerCase();
			if (![".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(extname)) {
				return;
			}

			// 画像データの読み込み
			const imageData = await file.data();
			const imageBuffer = Buffer.from(imageData);

			// 画像情報の取得
			let imageInfo;
			try {
				imageInfo = await ImageHelper.loadImageInfo(
					imageBuffer,
					file.uri.fsPath || file.uri.path
				);
				console.log("[Size] width: ", imageInfo.width, " height: ", imageInfo.height);

			} catch (e) {
				vscode.window.showErrorMessage("画像サイズの取得に失敗しました。");
				console.error(e);
				return;
			}

			// 幅入力メッセージの表示
			const inputWidthString: string | undefined = await vscode.window.showInputBox({
				prompt: "リサイズ後の幅 (px) を入力",
				placeHolder: "例: 600",
				value: imageInfo.width.toString(),
				validateInput: (value: string) => {
					const n = Number(value);
					if (value.trim() === "" || !Number.isInteger(n) || n <= 0) {
						return "正の整数を入力してください";
					}
					return null;
				},
			});
			if (inputWidthString === undefined) {
				return;
			}

			// 画像リサイズ・保存
			const newWidth: number = Number(inputWidthString);
			const newHeight: number = ImageHelper.calcHeightByWidth(
				newWidth,
				imageInfo.ratio
			);
			try {
				const outputPath = path.join(outputImageDir, imageInfo.name + extname);
				ImageHelper.resizeAndSave({
					imageBuffer: imageBuffer,
					outputPath,
					width: newWidth,
					height: newHeight,
				});
				console.log("[ReSize] width: ", newWidth, " height: ", newHeight);
				console.log(`[Output] ${outputPath}`);

			} catch (e) {
				vscode.window.showErrorMessage("画像ファイルの保存に失敗しました。");
				console.error(e);
				return;
			}

			// テキスト挿入
			const insertText = expandTemplate(insertTextFormat, {
				filename: imageInfo.name,
				width: getInsertTextWidth(newWidth).toString(),
			});
			return new vscode.DocumentDropEdit(insertText);
		}
	};

	// Providerを登録
	const selector: vscode.DocumentSelector = {
		scheme: "file",
		language: "markdown",
	};
	const disposable = vscode.languages.registerDocumentDropEditProvider(
		selector,
		provider
	);
	context.subscriptions.push(disposable);
}

export function deactivate() { }
