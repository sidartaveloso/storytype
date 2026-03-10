/**
 * Utility functions for Storytype pattern
 */

/**
 * Validates if a component name follows Storytype naming conventions
 */
export function validateComponentName(name: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name);
}

/**
 * Gets the component level from a path
 */
export function getComponentLevel(path: string): string | null {
  const levels = ['atoms', 'molecules', 'organisms', 'templates', 'pages'];
  for (const level of levels) {
    if (path.includes(`/${level}/`)) {
      return level.slice(0, -1); // Remove plural 's'
    }
  }
  return null;
}
