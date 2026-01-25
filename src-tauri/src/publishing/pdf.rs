//! PDF generation using printpdf

use super::{ExportDocument, PdfOptions, PublishingError};
use printpdf::*;
use std::fs::File;
use std::io::BufWriter;
use std::path::Path;

/// Strip HTML tags from content (basic implementation)
fn strip_html(html: &str) -> String {
    let mut result = String::new();
    let mut in_tag = false;

    for c in html.chars() {
        match c {
            '<' => in_tag = true,
            '>' => in_tag = false,
            _ if !in_tag => result.push(c),
            _ => {}
        }
    }

    // Decode common HTML entities
    result
        .replace("&nbsp;", " ")
        .replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&#39;", "'")
}

/// Word wrap text to fit within a given width (approximate)
fn word_wrap(text: &str, chars_per_line: usize) -> Vec<String> {
    let mut lines = Vec::new();

    for paragraph in text.split('\n') {
        if paragraph.trim().is_empty() {
            lines.push(String::new());
            continue;
        }

        let words: Vec<&str> = paragraph.split_whitespace().collect();
        let mut current_line = String::new();

        for word in words {
            if current_line.is_empty() {
                current_line = word.to_string();
            } else if current_line.len() + 1 + word.len() <= chars_per_line {
                current_line.push(' ');
                current_line.push_str(word);
            } else {
                lines.push(current_line);
                current_line = word.to_string();
            }
        }

        if !current_line.is_empty() {
            lines.push(current_line);
        }
    }

    lines
}

/// Generate a PDF document
pub fn generate_pdf(
    document: &ExportDocument,
    options: &PdfOptions,
    output_path: &Path,
) -> Result<(), PublishingError> {
    let (doc, page1, layer1) = PdfDocument::new(
        &document.metadata.title,
        Mm(options.page_width_mm),
        Mm(options.page_height_mm),
        "Layer 1",
    );

    let font = doc.add_builtin_font(BuiltinFont::Helvetica)
        .map_err(|e| PublishingError::PdfError(e.to_string()))?;

    let font_bold = doc.add_builtin_font(BuiltinFont::HelveticaBold)
        .map_err(|e| PublishingError::PdfError(e.to_string()))?;

    let margin = Mm(options.margin_mm);
    let content_width = options.page_width_mm - (2.0 * options.margin_mm);
    let chars_per_line = (content_width / 2.5) as usize; // Approximate

    let mut current_layer = doc.get_page(page1).get_layer(layer1);
    let mut y_position = options.page_height_mm - options.margin_mm;
    let line_height = options.font_size_pt * options.line_height * 0.35; // Convert to mm

    // Title page
    if options.include_title_page {
        let title_size = 24.0_f32;
        let author_size = 14.0_f32;

        // Center title
        current_layer.use_text(
            &document.metadata.title,
            title_size,
            Mm(options.page_width_mm / 2.0 - (document.metadata.title.len() as f32 * 3.0)),
            Mm(options.page_height_mm / 2.0),
            &font_bold,
        );

        // Author below title
        if let Some(ref author) = document.metadata.author {
            current_layer.use_text(
                author,
                author_size,
                Mm(options.page_width_mm / 2.0 - (author.len() as f32 * 2.0)),
                Mm(options.page_height_mm / 2.0 - 20.0),
                &font,
            );
        }

        // New page for content
        let (page, layer) = doc.add_page(
            Mm(options.page_width_mm),
            Mm(options.page_height_mm),
            "Content",
        );
        current_layer = doc.get_page(page).get_layer(layer);
        y_position = options.page_height_mm - options.margin_mm;
    }

    // Table of contents
    if options.include_toc && !document.chapters.is_empty() {
        current_layer.use_text(
            "Table of Contents",
            16.0_f32,
            margin,
            Mm(y_position),
            &font_bold,
        );
        y_position -= line_height * 2.0;

        for (i, chapter) in document.chapters.iter().enumerate() {
            let chapter_num = chapter.number.unwrap_or((i + 1) as i32);
            let toc_entry = format!("{}. {}", chapter_num, chapter.title);

            current_layer.use_text(
                &toc_entry,
                options.font_size_pt,
                margin,
                Mm(y_position),
                &font,
            );
            y_position -= line_height;
        }

        // New page after TOC
        let (page, layer) = doc.add_page(
            Mm(options.page_width_mm),
            Mm(options.page_height_mm),
            "Chapters",
        );
        current_layer = doc.get_page(page).get_layer(layer);
        y_position = options.page_height_mm - options.margin_mm;
    }

    // Chapters
    for (i, chapter) in document.chapters.iter().enumerate() {
        let chapter_num = chapter.number.unwrap_or((i + 1) as i32);
        let chapter_title = format!("Chapter {}: {}", chapter_num, chapter.title);

        // Chapter title
        current_layer.use_text(
            &chapter_title,
            16.0_f32,
            margin,
            Mm(y_position),
            &font_bold,
        );
        y_position -= line_height * 2.0;

        // Chapter content
        let clean_content = strip_html(&chapter.content);
        let lines = word_wrap(&clean_content, chars_per_line);

        for line in lines {
            if y_position < options.margin_mm + line_height {
                // New page
                let (page, layer) = doc.add_page(
                    Mm(options.page_width_mm),
                    Mm(options.page_height_mm),
                    "Content",
                );
                current_layer = doc.get_page(page).get_layer(layer);
                y_position = options.page_height_mm - options.margin_mm;
            }

            if line.is_empty() {
                y_position -= line_height * 0.5; // Paragraph spacing
            } else {
                current_layer.use_text(
                    &line,
                    options.font_size_pt,
                    margin,
                    Mm(y_position),
                    &font,
                );
                y_position -= line_height;
            }
        }

        // Space after chapter
        y_position -= line_height * 2.0;

        // New page for next chapter if not enough space
        if y_position < options.page_height_mm / 3.0 && i < document.chapters.len() - 1 {
            let (page, layer) = doc.add_page(
                Mm(options.page_width_mm),
                Mm(options.page_height_mm),
                "Content",
            );
            current_layer = doc.get_page(page).get_layer(layer);
            y_position = options.page_height_mm - options.margin_mm;
        }
    }

    // Save the PDF
    let file = File::create(output_path)?;
    let mut writer = BufWriter::new(file);
    doc.save(&mut writer)
        .map_err(|e| PublishingError::PdfError(e.to_string()))?;

    Ok(())
}

/// Generate PDF and return as bytes
pub fn generate_pdf_bytes(
    document: &ExportDocument,
    options: &PdfOptions,
) -> Result<Vec<u8>, PublishingError> {
    // Create a temporary file, generate PDF, then read bytes
    let temp_dir = std::env::temp_dir();
    let temp_path = temp_dir.join(format!("plumai_temp_{}.pdf", uuid::Uuid::new_v4()));

    generate_pdf(document, options, &temp_path)?;

    let bytes = std::fs::read(&temp_path)?;
    let _ = std::fs::remove_file(&temp_path);

    Ok(bytes)
}
