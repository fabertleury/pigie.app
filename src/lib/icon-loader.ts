import * as LucideIcons from 'lucide-react';

export function loadIcon(name: string) {
  const IconComponent = (LucideIcons as any)[name];
  
  if (!IconComponent) {
    console.warn(`Icon ${name} not found`);
    return LucideIcons.AlertTriangle; // Fallback icon
  }
  
  return IconComponent;
}
