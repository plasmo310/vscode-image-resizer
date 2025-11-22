import sharp from "sharp";
import * as path from "path";
import * as fs from "fs/promises";

/**
 * 画像情報
 */
export interface ImageInfo {
    path: string;
    name: string;
    extension: string;
    width: number;
    height: number;
    ratio: number;
}

/**
 * 画像関連ヘルパークラス
 */
export class ImageHelper {
    /**
     * バッファから画像情報取得
     */
    static async loadImageInfo(
        imageBuffer: Buffer,
        filePath: string
    ): Promise<ImageInfo> {
        const fullName = path.basename(filePath);
        const ext = path.extname(fullName).replace(".", "").toLowerCase();
        const name = path.basename(fullName, path.extname(fullName));

        const metadata = await sharp(imageBuffer).metadata();
        if (!metadata.width || !metadata.height) {
            throw new Error("画像サイズ取得に失敗しました");
        }

        return {
            path: filePath,
            name,
            extension: ext,
            width: metadata.width,
            height: metadata.height,
            ratio: metadata.width / metadata.height,
        };
    }

    /**
     * 横幅から比率固定で高さを計算
     */
    static calcHeightByWidth(
        targetWidth: number,
        ratio: number
    ): number {
        return Math.round(targetWidth / ratio)
    }

    /**
     * リサイズしてファイルとして保存
     * ※ GIFはリサイズ対応していないためそのまま保存
     */
    static async resizeAndSave(options: {
        imageBuffer: Buffer,
        outputPath: string,
        width: number,
        height: number,
        extension: string
    }): Promise<void> {
        const { imageBuffer, outputPath, width, height, extension } = options;

        // gif はリサイズせずそのまま書き出し
        if (extension.toLowerCase() === "gif") {
            await fs.writeFile(outputPath, imageBuffer);
            return;
        }

        // リサイズして保存
        await sharp(imageBuffer)
            .resize({
                width,
                height: height ?? undefined,
            })
            .toFile(outputPath);
    }
}
