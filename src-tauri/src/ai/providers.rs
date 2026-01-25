//! AI Provider implementations

use super::{AiChatRequest, AiChatResponse, AiProvider, TokenUsage};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AiError {
    #[error("HTTP request failed: {0}")]
    RequestFailed(#[from] reqwest::Error),
    #[error("API error: {0}")]
    ApiError(String),
    #[allow(dead_code)]
    #[error("Invalid response: {0}")]
    InvalidResponse(String),
}

/// Send a chat request to the appropriate AI provider
pub async fn send_chat(request: AiChatRequest) -> Result<AiChatResponse, AiError> {
    match request.provider {
        AiProvider::Claude => send_claude_chat(request).await,
        AiProvider::Openai => send_openai_chat(request).await,
        AiProvider::Gemini => send_gemini_chat(request).await,
    }
}

// ============================================================================
// Claude (Anthropic)
// ============================================================================

#[derive(Serialize)]
struct ClaudeRequest {
    model: String,
    max_tokens: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    system: Option<String>,
    messages: Vec<ClaudeMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    temperature: Option<f32>,
}

#[derive(Serialize)]
struct ClaudeMessage {
    role: String,
    content: String,
}

#[derive(Deserialize)]
struct ClaudeResponse {
    content: Vec<ClaudeContent>,
    model: String,
    usage: ClaudeUsage,
}

#[derive(Deserialize)]
struct ClaudeContent {
    text: String,
}

#[derive(Deserialize)]
struct ClaudeUsage {
    input_tokens: u32,
    output_tokens: u32,
}

#[derive(Deserialize)]
struct ClaudeError {
    error: ClaudeErrorDetail,
}

#[derive(Deserialize)]
struct ClaudeErrorDetail {
    message: String,
}

async fn send_claude_chat(request: AiChatRequest) -> Result<AiChatResponse, AiError> {
    let client = Client::new();

    let claude_request = ClaudeRequest {
        model: request.model.unwrap_or_else(|| "claude-sonnet-4-20250514".to_string()),
        max_tokens: request.max_tokens.unwrap_or(4096),
        system: request.system_prompt,
        messages: request
            .messages
            .into_iter()
            .map(|m| ClaudeMessage {
                role: m.role,
                content: m.content,
            })
            .collect(),
        temperature: request.temperature,
    };

    let response = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", &request.api_key)
        .header("anthropic-version", "2023-06-01")
        .header("content-type", "application/json")
        .json(&claude_request)
        .send()
        .await?;

    if !response.status().is_success() {
        let error: ClaudeError = response.json().await?;
        return Err(AiError::ApiError(error.error.message));
    }

    let claude_response: ClaudeResponse = response.json().await?;

    Ok(AiChatResponse {
        content: claude_response
            .content
            .first()
            .map(|c| c.text.clone())
            .unwrap_or_default(),
        model: claude_response.model,
        usage: Some(TokenUsage {
            input_tokens: claude_response.usage.input_tokens,
            output_tokens: claude_response.usage.output_tokens,
        }),
    })
}

// ============================================================================
// OpenAI (GPT)
// ============================================================================

#[derive(Serialize)]
struct OpenAiRequest {
    model: String,
    messages: Vec<OpenAiMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    max_tokens: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    temperature: Option<f32>,
}

#[derive(Serialize)]
struct OpenAiMessage {
    role: String,
    content: String,
}

#[derive(Deserialize)]
struct OpenAiResponse {
    choices: Vec<OpenAiChoice>,
    model: String,
    usage: OpenAiUsage,
}

#[derive(Deserialize)]
struct OpenAiChoice {
    message: OpenAiMessageResponse,
}

#[derive(Deserialize)]
struct OpenAiMessageResponse {
    content: String,
}

#[derive(Deserialize)]
struct OpenAiUsage {
    prompt_tokens: u32,
    completion_tokens: u32,
}

#[derive(Deserialize)]
struct OpenAiError {
    error: OpenAiErrorDetail,
}

#[derive(Deserialize)]
struct OpenAiErrorDetail {
    message: String,
}

async fn send_openai_chat(request: AiChatRequest) -> Result<AiChatResponse, AiError> {
    let client = Client::new();

    let mut messages: Vec<OpenAiMessage> = vec![];

    // Add system prompt if present
    if let Some(system) = request.system_prompt {
        messages.push(OpenAiMessage {
            role: "system".to_string(),
            content: system,
        });
    }

    // Add user messages
    messages.extend(request.messages.into_iter().map(|m| OpenAiMessage {
        role: m.role,
        content: m.content,
    }));

    let openai_request = OpenAiRequest {
        model: request.model.unwrap_or_else(|| "gpt-4o".to_string()),
        messages,
        max_tokens: request.max_tokens,
        temperature: request.temperature,
    };

    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", request.api_key))
        .header("content-type", "application/json")
        .json(&openai_request)
        .send()
        .await?;

    if !response.status().is_success() {
        let error: OpenAiError = response.json().await?;
        return Err(AiError::ApiError(error.error.message));
    }

    let openai_response: OpenAiResponse = response.json().await?;

    Ok(AiChatResponse {
        content: openai_response
            .choices
            .first()
            .map(|c| c.message.content.clone())
            .unwrap_or_default(),
        model: openai_response.model,
        usage: Some(TokenUsage {
            input_tokens: openai_response.usage.prompt_tokens,
            output_tokens: openai_response.usage.completion_tokens,
        }),
    })
}

// ============================================================================
// Google Gemini
// ============================================================================

#[derive(Serialize)]
struct GeminiRequest {
    contents: Vec<GeminiContent>,
    #[serde(skip_serializing_if = "Option::is_none")]
    system_instruction: Option<GeminiSystemInstruction>,
    #[serde(skip_serializing_if = "Option::is_none", rename = "generationConfig")]
    generation_config: Option<GeminiGenerationConfig>,
}

#[derive(Serialize)]
struct GeminiContent {
    role: String,
    parts: Vec<GeminiPart>,
}

#[derive(Serialize)]
struct GeminiPart {
    text: String,
}

#[derive(Serialize)]
struct GeminiSystemInstruction {
    parts: Vec<GeminiPart>,
}

#[derive(Serialize)]
struct GeminiGenerationConfig {
    #[serde(skip_serializing_if = "Option::is_none", rename = "maxOutputTokens")]
    max_output_tokens: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    temperature: Option<f32>,
}

#[derive(Deserialize)]
struct GeminiResponse {
    candidates: Vec<GeminiCandidate>,
    #[serde(rename = "usageMetadata")]
    usage_metadata: Option<GeminiUsage>,
}

#[derive(Deserialize)]
struct GeminiCandidate {
    content: GeminiContentResponse,
}

#[derive(Deserialize)]
struct GeminiContentResponse {
    parts: Vec<GeminiPartResponse>,
}

#[derive(Deserialize)]
struct GeminiPartResponse {
    text: String,
}

#[derive(Deserialize)]
struct GeminiUsage {
    #[serde(rename = "promptTokenCount")]
    prompt_token_count: u32,
    #[serde(rename = "candidatesTokenCount")]
    candidates_token_count: u32,
}

#[derive(Deserialize)]
struct GeminiError {
    error: GeminiErrorDetail,
}

#[derive(Deserialize)]
struct GeminiErrorDetail {
    message: String,
}

async fn send_gemini_chat(request: AiChatRequest) -> Result<AiChatResponse, AiError> {
    let client = Client::new();

    let model = request.model.unwrap_or_else(|| "gemini-2.0-flash".to_string());

    let gemini_request = GeminiRequest {
        contents: request
            .messages
            .into_iter()
            .map(|m| GeminiContent {
                role: if m.role == "assistant" {
                    "model".to_string()
                } else {
                    m.role
                },
                parts: vec![GeminiPart { text: m.content }],
            })
            .collect(),
        system_instruction: request.system_prompt.map(|s| GeminiSystemInstruction {
            parts: vec![GeminiPart { text: s }],
        }),
        generation_config: Some(GeminiGenerationConfig {
            max_output_tokens: request.max_tokens,
            temperature: request.temperature,
        }),
    };

    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
        model, request.api_key
    );

    let response = client
        .post(&url)
        .header("content-type", "application/json")
        .json(&gemini_request)
        .send()
        .await?;

    if !response.status().is_success() {
        let error: GeminiError = response.json().await?;
        return Err(AiError::ApiError(error.error.message));
    }

    let gemini_response: GeminiResponse = response.json().await?;

    Ok(AiChatResponse {
        content: gemini_response
            .candidates
            .first()
            .and_then(|c| c.content.parts.first())
            .map(|p| p.text.clone())
            .unwrap_or_default(),
        model,
        usage: gemini_response.usage_metadata.map(|u| TokenUsage {
            input_tokens: u.prompt_token_count,
            output_tokens: u.candidates_token_count,
        }),
    })
}
