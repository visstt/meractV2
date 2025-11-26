// Утилита для извлечения названия трека из URL
export const extractMusicTitle = (fileName) => {
  if (!fileName) return "Unknown Track";

  try {
    // Извлекаем название файла из URL
    const urlParts = fileName.split("/");
    const fileNameWithExtension = urlParts[urlParts.length - 1];

    // Убираем расширение файла
    const nameWithoutExtension = fileNameWithExtension.replace(/\.[^/.]+$/, "");

    // Убираем timestamp (если есть паттерн типа "1762087771198-774269634")
    const cleanName = nameWithoutExtension
      .replace(/^\d+-\d+-/, "")
      .replace(/^\d+-/, "");

    // Если после очистки осталось что-то разумное, используем это
    if (cleanName && cleanName.length > 0) {
      // Заменяем подчеркивания и дефисы на пробелы
      return cleanName.replace(/[_-]/g, " ").trim();
    }

    // В противном случае возвращаем оригинальное название без расширения
    return nameWithoutExtension.replace(/[_-]/g, " ").trim() || "Unknown Track";
  } catch (error) {
    console.error("Error extracting music title:", error);
    return "Unknown Track";
  }
};
