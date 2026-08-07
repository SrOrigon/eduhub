const MAX_EDGE = 512;
const MAX_BYTES = 280_000;
const QUALITY_STEPS = [0.82, 0.72, 0.62, 0.52];

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler a imagem."));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

export async function compressAvatarFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem.");
  }

  const img = await loadImage(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível processar a imagem.");

  ctx.drawImage(img, 0, 0, width, height);

  const outputType = file.type === "image/png" || file.type === "image/gif" ? file.type : "image/jpeg";

  for (const quality of QUALITY_STEPS) {
    const blob = await canvasToBlob(canvas, outputType, quality);
    if (!blob) continue;
    if (blob.size <= MAX_BYTES) {
      const ext = outputType === "image/png" ? "png" : outputType === "image/gif" ? "gif" : "jpg";
      return new File([blob], `avatar.${ext}`, { type: outputType });
    }
  }

  const fallback = await canvasToBlob(canvas, "image/jpeg", 0.45);
  if (!fallback) throw new Error("Não foi possível comprimir a imagem.");
  return new File([fallback], "avatar.jpg", { type: "image/jpeg" });
}
