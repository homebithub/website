import sharp from "sharp";
import fs from "fs";

const inputPath = "./public/logo_512x512.png";
const outputPath = "./public/favicon.ico";

(async () => {
  await sharp(inputPath)
    .resize(48, 48)
    .toFormat("ico")
    .toFile(outputPath);
})();
