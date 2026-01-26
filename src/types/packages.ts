export type PackageCategory = 'content' | 'identity' | 'hybrid';

export interface PackageMetadata {
  name: string;
  description: string;
}

export interface PackageStyles {
  theme?: string;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
  banners: Record<string, string>;
}

export interface PackageContent {
  creatures?: any[];
  characters?: any[];
  lore_items?: any[];
}

export interface PackageManifest {
  id: string;
  version: string;
  author: string;
  category: PackageCategory;
  metadata: Record<string, PackageMetadata>; // Language code -> Metadata
  styles?: PackageStyles;
  content?: PackageContent;
}
