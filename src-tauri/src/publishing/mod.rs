//! Publishing module for PDF and DOCX generation
//!
//! Provides native document generation capabilities.

mod docx;
mod pdf;

pub use docx::*;
pub use pdf::*;

use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum PublishingError {
    #[error("PDF generation failed: {0}")]
    PdfError(String),
    #[error("DOCX generation failed: {0}")]
    DocxError(String),
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
}

/// Document metadata for export
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentMetadata {
    pub title: String,
    pub author: Option<String>,
    pub description: Option<String>,
}

/// Chapter content for export
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportChapter {
    pub title: String,
    pub number: Option<i32>,
    pub content: String,
}

/// Full document for export
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportDocument {
    pub metadata: DocumentMetadata,
    pub chapters: Vec<ExportChapter>,
}

/// PDF export options
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PdfOptions {
    #[serde(default = "default_page_width")]
    pub page_width_mm: f32,
    #[serde(default = "default_page_height")]
    pub page_height_mm: f32,
    #[serde(default = "default_margin")]
    pub margin_mm: f32,
    #[serde(default = "default_font_size")]
    pub font_size_pt: f32,
    #[serde(default = "default_line_height")]
    pub line_height: f32,
    #[serde(default)]
    pub include_title_page: bool,
    #[serde(default)]
    pub include_toc: bool,
}

impl Default for PdfOptions {
    fn default() -> Self {
        Self {
            page_width_mm: default_page_width(),
            page_height_mm: default_page_height(),
            margin_mm: default_margin(),
            font_size_pt: default_font_size(),
            line_height: default_line_height(),
            include_title_page: true,
            include_toc: true,
        }
    }
}

/// DOCX export options
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DocxOptions {
    #[serde(default = "default_font_size")]
    pub font_size_pt: f32,
    #[serde(default)]
    pub include_title_page: bool,
    #[serde(default)]
    pub include_toc: bool,
}

impl Default for DocxOptions {
    fn default() -> Self {
        Self {
            font_size_pt: default_font_size(),
            include_title_page: true,
            include_toc: true,
        }
    }
}

fn default_page_width() -> f32 {
    210.0 // A4 width in mm
}

fn default_page_height() -> f32 {
    297.0 // A4 height in mm
}

fn default_margin() -> f32 {
    25.0 // 25mm margins
}

fn default_font_size() -> f32 {
    12.0
}

fn default_line_height() -> f32 {
    1.5
}
