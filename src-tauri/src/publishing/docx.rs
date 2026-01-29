//! DOCX generation using docx-rs

use super::{DocxOptions, ExportDocument, PublishingError};
use docx_rs::*;
use std::fs::File;
use std::io::{Cursor, Write};
use std::path::Path;

/// Strip HTML tags from content
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

    result
        .replace("&nbsp;", " ")
        .replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&#39;", "'")
}

/// Generate a DOCX document
pub fn generate_docx(
    document: &ExportDocument,
    options: &DocxOptions,
    output_path: &Path,
) -> Result<(), PublishingError> {
    let bytes = generate_docx_bytes(document, options)?;

    let mut file = File::create(output_path)?;
    file.write_all(&bytes)?;

    Ok(())
}

/// Generate DOCX and return as bytes
pub fn generate_docx_bytes(
    document: &ExportDocument,
    options: &DocxOptions,
) -> Result<Vec<u8>, PublishingError> {
    let mut docx = Docx::new();

    let font_size = (options.font_size_pt * 2.0) as usize; // Half-points
    let title_size = 48usize; // 24pt in half-points
    let heading_size = 32usize; // 16pt in half-points

    // Title page
    if options.include_title_page {
        // Title
        docx = docx.add_paragraph(
            Paragraph::new()
                .add_run(
                    Run::new()
                        .add_text(&document.metadata.title)
                        .size(title_size)
                        .bold(),
                )
                .align(AlignmentType::Center),
        );

        // Author
        if let Some(ref author) = document.metadata.author {
            docx = docx.add_paragraph(
                Paragraph::new()
                    .add_run(Run::new().add_text(author).size(font_size))
                    .align(AlignmentType::Center),
            );
        }

        // Description
        if let Some(ref description) = document.metadata.description {
            docx = docx.add_paragraph(
                Paragraph::new()
                    .add_run(Run::new().add_text(description).size(font_size).italic())
                    .align(AlignmentType::Center),
            );
        }

        // Page break after title page
        docx = docx.add_paragraph(Paragraph::new().add_run(Run::new().add_break(BreakType::Page)));
    }

    // Table of contents (placeholder - actual TOC requires field codes)
    if options.include_toc && !document.chapters.is_empty() {
        docx = docx.add_paragraph(
            Paragraph::new().add_run(
                Run::new()
                    .add_text("Table of Contents")
                    .size(heading_size)
                    .bold(),
            ),
        );

        for (i, chapter) in document.chapters.iter().enumerate() {
            let chapter_num = chapter.number.unwrap_or((i + 1) as i32);
            let toc_entry = format!("{}. {}", chapter_num, chapter.title);

            docx = docx.add_paragraph(
                Paragraph::new().add_run(Run::new().add_text(&toc_entry).size(font_size)),
            );
        }

        // Page break after TOC
        docx = docx.add_paragraph(Paragraph::new().add_run(Run::new().add_break(BreakType::Page)));
    }

    // Chapters
    for (i, chapter) in document.chapters.iter().enumerate() {
        let chapter_num = chapter.number.unwrap_or((i + 1) as i32);
        let chapter_title = format!("Chapter {}: {}", chapter_num, chapter.title);

        // Chapter heading
        docx = docx.add_paragraph(
            Paragraph::new().add_run(
                Run::new()
                    .add_text(&chapter_title)
                    .size(heading_size)
                    .bold(),
            ),
        );

        // Empty line after heading
        docx = docx.add_paragraph(Paragraph::new());

        // Chapter content
        let clean_content = strip_html(&chapter.content);

        for paragraph in clean_content.split('\n') {
            let trimmed = paragraph.trim();
            if trimmed.is_empty() {
                docx = docx.add_paragraph(Paragraph::new());
            } else {
                docx = docx.add_paragraph(
                    Paragraph::new().add_run(Run::new().add_text(trimmed).size(font_size)),
                );
            }
        }

        // Page break between chapters (except last)
        if i < document.chapters.len() - 1 {
            docx =
                docx.add_paragraph(Paragraph::new().add_run(Run::new().add_break(BreakType::Page)));
        }
    }

    // Generate bytes
    let mut buffer = Cursor::new(Vec::new());
    docx.build()
        .pack(&mut buffer)
        .map_err(|e| PublishingError::DocxError(format!("{:?}", e)))?;

    Ok(buffer.into_inner())
}
