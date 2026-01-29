export type PackageCategory = 'content' | 'identity' | 'hybrid' | 'template';

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
  zine_templates?: any[];
}

export interface PackageManifest {
  id: string;
  version: string;
  author: string;
  category: PackageCategory;
  metadata: Record<string, PackageMetadata>; // Language code -> Metadata
  min_app_version?: string;
  styles?: PackageStyles;
  content?: PackageContent;
}

// ============================================================================
// Registry / Package Store types
// ============================================================================

export interface RegistrySource {
  id: string;
  url: string;
  name: string;
  enabled: boolean;
  is_official: boolean;
}

export interface CatalogPackage {
  id: string;
  version: string;
  author: string;
  category: PackageCategory;
  min_app_version?: string;
  metadata: Record<string, PackageMetadata>;
  download_url: string;
  size_bytes: number;
  checksum_sha256: string;
  tags: string[];
  registry_id: string;
  is_installed: boolean;
  installed_version?: string;
  has_update: boolean;
}

export interface InstalledPackageInfo {
  id: string;
  version: string;
  author: string;
  category: string;
  registry_id: string;
  metadata: string; // JSON string
  checksum: string;
  size_bytes: number;
  install_path: string;
  installed_at?: string;
  updated_at?: string;
}

export interface PackageUpdateInfo {
  id: string;
  current_version: string;
  available_version: string;
  registry_id: string;
}
