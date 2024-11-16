export function mapToUpdate(group: unknown, updateGroupDto: unknown): void {
  for (const [key, value] of Object.entries(updateGroupDto)) {
    group[key] = value;
  }
}
