export function mapToUpdate(target: unknown, source: unknown): unknown {
  if (Array.isArray(target) && Array.isArray(source)) {
    return [...source]; // Обновление массива
  }
  if (target !== null && typeof target === 'object' && typeof source === 'object') {
    const updated = { ...target };
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        updated[key] = mapToUpdate(updated[key], source[key]);
      }
    }
    return updated;
  }
  return source; // Для примитивных типов
}
