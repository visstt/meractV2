export const extractMusicTitle = (fileName) => {
  if (!fileName) return "Unknown Track";

  try {
    const urlParts = fileName.split("/");
    const fileNameWithExtension = urlParts[urlParts.length - 1];

    const nameWithoutExtension = fileNameWithExtension.replace(/\.[^/.]+$/, "");

    const cleanName = nameWithoutExtension
      .replace(/^\d+-\d+-/, "")
      .replace(/^\d+-/, "");

    if (cleanName && cleanName.length > 0) {
      const formatted = cleanName.replace(/[_-]/g, " ").trim();

      if (formatted.length > 15) {
        return formatted.substring(0, 15) + "..";
      }

      return formatted;
    }

    const fallback = nameWithoutExtension.replace(/[_-]/g, " ").trim();
    if (fallback.length > 15) {
      return fallback.substring(0, 15) + "..";
    }

    return fallback || "Unknown Track";
  } catch (error) {
    console.error("Error extracting music title:", error);
    return "Unknown Track";
  }
};
