/**
 * Видео эффекты для стрима
 * Применяются в реальном времени через Canvas API
 */

export const VIDEO_EFFECTS = {
  NONE: {
    id: "none",
    name: "No Effect",
    description: "Original video without any effects",
    icon: "🎬",
  },
  VIGNETTE: {
    id: "vignette",
    name: "Vignette",
    description: "Dark edges effect",
    icon: "🌑",
  },
  WARM_LIGHT: {
    id: "warm_light",
    name: "Warm Light",
    description: "Orange/golden tint",
    icon: "🔥",
  },
  COLD_LIGHT: {
    id: "cold_light",
    name: "Cold Light",
    description: "Blue/cool tint",
    icon: "❄️",
  },
};

export class VideoEffectsProcessor {
  constructor(sourceVideo, options = {}) {
    this.sourceVideo = sourceVideo;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    this.animationFrameId = null;
    this.isProcessing = false;

    this.effects = {
      vignette: options.vignette !== undefined ? options.vignette : true,
      colorFilter: options.colorFilter || "warm",
      vignetteIntensity: options.vignetteIntensity || 0.6,
      colorIntensity: options.colorIntensity || 0.3,
    };

    console.log("VideoEffectsProcessor created with settings:", this.effects);
  }

  setupCanvas() {
    if (this.sourceVideo.videoWidth && this.sourceVideo.videoHeight) {
      this.canvas.width = this.sourceVideo.videoWidth;
      this.canvas.height = this.sourceVideo.videoHeight;
    } else {
      this.canvas.width = 1280;
      this.canvas.height = 720;
    }

    console.log("Canvas setup:", this.canvas.width, "x", this.canvas.height);
  }


  applyVignette() {
    if (!this.effects.vignette) return;

    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.sqrt(centerX * centerX + centerY * centerY);

    const gradient = this.ctx.createRadialGradient(
      centerX,
      centerY,
      radius * 0.3,
      centerX,
      centerY,
      radius,
    );

    gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
    gradient.addColorStop(
      0.7,
      `rgba(0, 0, 0, ${this.effects.vignetteIntensity * 0.3})`,
    );
    gradient.addColorStop(
      1,
      `rgba(0, 0, 0, ${this.effects.vignetteIntensity})`,
    );

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
  }


  applyColorFilter() {
    if (this.effects.colorFilter === "none") return;

    const { width, height } = this.canvas;
    const imageData = this.ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const intensity = this.effects.colorIntensity;

    if (this.effects.colorFilter === "warm") {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] + 30 * intensity); 
        data[i + 1] = Math.min(255, data[i + 1] + 15 * intensity); 
        data[i + 2] = Math.max(0, data[i + 2] - 10 * intensity); 
      }
    } else if (this.effects.colorFilter === "cold") {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.max(0, data[i] - 10 * intensity); 
        data[i + 1] = Math.min(255, data[i + 1] + 5 * intensity); 
        data[i + 2] = Math.min(255, data[i + 2] + 30 * intensity);  
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  processFrame() {
    if (!this.isProcessing) return;

    try {
      if (
        this.sourceVideo.videoWidth !== this.canvas.width ||
        this.sourceVideo.videoHeight !== this.canvas.height
      ) {
        this.setupCanvas();
      }

      this.ctx.drawImage(
        this.sourceVideo,
        0,
        0,
        this.canvas.width,
        this.canvas.height,
      );

      this.applyColorFilter();

      this.applyVignette();

      this.animationFrameId = requestAnimationFrame(() => this.processFrame());
    } catch (error) {
      console.error("Error processing frame:", error);
    }
  }


  start() {
    if (this.isProcessing) {
      console.warn("Video effects processor already running");
      return;
    }

    console.log("Starting video effects processor");
    this.setupCanvas();
    this.isProcessing = true;
    this.processFrame();
  }


  stop() {
    console.log("Stopping video effects processor");
    this.isProcessing = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }


  getStream(fps = 30) {
    return this.canvas.captureStream(fps);
  }


  updateEffects(newEffects) {
    this.effects = { ...this.effects, ...newEffects };
    console.log("Effects updated:", this.effects);
  }


  dispose() {
    this.stop();
    this.canvas = null;
    this.ctx = null;
    this.sourceVideo = null;
  }
}


export const applyVignetteEffect = (ctx, width, height) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.max(width, height) / 1.5;

  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    radius * 0.3,
    centerX,
    centerY,
    radius,
  );

  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(0.5, "rgba(0, 0, 0, 0.1)");
  gradient.addColorStop(0.8, "rgba(0, 0, 0, 0.4)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.8)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};


export const applyWarmLightEffect = (ctx, width, height) => {
  ctx.fillStyle = "rgba(255, 150, 50, 0.15)";
  ctx.fillRect(0, 0, width, height);

  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    Math.max(width, height) / 2,
  );

  gradient.addColorStop(0, "rgba(255, 200, 100, 0)");
  gradient.addColorStop(1, "rgba(255, 150, 50, 0.1)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};


export const applyColdLightEffect = (ctx, width, height) => {
  ctx.fillStyle = "rgba(100, 150, 255, 0.15)";
  ctx.fillRect(0, 0, width, height);

  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    Math.max(width, height) / 2,
  );

  gradient.addColorStop(0, "rgba(150, 200, 255, 0)");
  gradient.addColorStop(1, "rgba(100, 150, 255, 0.1)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};


export const applyVideoEffect = (ctx, width, height, effectId) => {
  switch (effectId) {
    case VIDEO_EFFECTS.VIGNETTE.id:
      applyVignetteEffect(ctx, width, height);
      break;
    case VIDEO_EFFECTS.WARM_LIGHT.id:
      applyWarmLightEffect(ctx, width, height);
      break;
    case VIDEO_EFFECTS.COLD_LIGHT.id:
      applyColdLightEffect(ctx, width, height);
      break;
    case VIDEO_EFFECTS.NONE.id:
    default:
      break;
  }
};


export const createVideoStreamWithEffect = (
  videoElement,
  effectId,
  fps = 30,
) => {
  if (!videoElement || effectId === VIDEO_EFFECTS.NONE.id) {
    return videoElement.captureStream ? videoElement.captureStream(fps) : null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = videoElement.videoWidth || 1280;
  canvas.height = videoElement.videoHeight || 720;
  const ctx = canvas.getContext("2d");

  const drawFrame = () => {
    if (!videoElement.paused && !videoElement.ended) {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      applyVideoEffect(ctx, canvas.width, canvas.height, effectId);

      requestAnimationFrame(drawFrame);
    }
  };

  drawFrame();

  return canvas.captureStream(fps);
};


export const createEffectPreview = (canvas, effectId) => {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  const baseGradient = ctx.createLinearGradient(0, 0, width, height);
  baseGradient.addColorStop(0, "#1a1a1a");
  baseGradient.addColorStop(0.5, "#3a3a3a");
  baseGradient.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = baseGradient;
  ctx.fillRect(0, 0, width, height);

  applyVideoEffect(ctx, width, height, effectId);

  const effect = Object.values(VIDEO_EFFECTS).find((e) => e.id === effectId);
  if (effect) {
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(effect.icon, width / 2, height / 2 - 10);
    ctx.font = "12px Arial";
    ctx.fillText(effect.name, width / 2, height / 2 + 15);
  }
};
