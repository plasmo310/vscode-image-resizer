import sharp from "sharp";
import * as path from "path";

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
     */
    static async resizeAndSave(options: {
        imageBuffer: Buffer,
        outputPath: string,
        width: number,
        height: number
    }): Promise<void> {
        const { imageBuffer: buffer, outputPath, width, height } = options;

        await sharp(buffer)
            .resize({
                width,
                height: height ?? undefined,
            })
            .toFile(outputPath);
    }
}
