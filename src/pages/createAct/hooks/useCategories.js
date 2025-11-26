import { useEffect, useState } from "react";

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      // Используем статичные категории
      const staticCategories = [
        { id: 1, name: "Gaming" },
        { id: 2, name: "Music" },
        { id: 3, name: "Art" },
        { id: 4, name: "Talk Show" },
        { id: 5, name: "Education" },
        { id: 6, name: "Sports" },
        { id: 7, name: "Technology" },
        { id: 8, name: "Entertainment" },
      ];

      setCategories(staticCategories);
    } catch (err) {
      console.error("Error setting categories:", err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const getCategoryById = (id) => {
    return categories.find((category) => category.id === id);
  };

  const getCategoryByName = (name) => {
    return categories.find(
      (category) => category.name.toLowerCase() === name.toLowerCase(),
    );
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    getCategoryById,
    getCategoryByName,
  };
}
