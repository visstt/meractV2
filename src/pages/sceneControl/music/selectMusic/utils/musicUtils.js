// Utility for extracting track title from URL or file name
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
      return cleanName.replace(/[_-]/g, " ").trim();
    }

    return nameWithoutExtension.replace(/[_-]/g, " ").trim() || "Unknown Track";
  } catch (error) {
    console.error("Error extracting music title:", error);
    return "Unknown Track";
  }
};
