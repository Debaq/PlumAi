import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateTextAI } from '@/lib/ai/client-ai';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { cn } from '@/lib/utils';

interface AITextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  context?: string;
  label?: string;
}

export const AITextArea = React.forwardRef<HTMLTextAreaElement, AITextAreaProps>(
  ({ className, value, onChange, context, label, placeholder, ...props }, ref) => {
    const { activeProvider, activeModel } = useSettingsStore();
    const { activeProject } = useProjectStore();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
      if (isGenerating) return;
      setIsGenerating(true);

      try {
        const keys = activeProject?.apiKeys?.text[activeProvider] || [];
        const apiKeyEntry = keys.find(k => k.isDefault) || keys[0];
        const apiKey = apiKeyEntry?.key;

        // Simple prompt based on context
        const prompt = `Task: Write or improve the following text field.
        Context: ${context || 'A creative writing project.'}
        Field Label: ${label || 'Text Area'}
        Current Content: ${value || '(Empty)'}
        Instruction: Expand on this, write a draft, or improve the style to be more engaging. Keep it concise if it's a short field.`;

        const stream = await generateTextAI(
            [{ role: 'user', content: prompt }],
            activeProvider,
            activeModel,
            apiKey || ''
        );

        let generatedText = '';
        // If there was content, we might append or replace. For now, let's just append if empty, or replace if selected (conceptually).
        // To keep it simple, we'll stream into the value.
        // NOTE: standard textarea onChange expects an event. We need to manually fire it or just update if controlled.
        // Since we receive `onChange` prop, we should call it.
        
        // However, we can't easily stream into a controlled input without internal state or specialized handler.
        // Let's accumulate and call onChange at chunks or end.
        
        // Hack for controlled input streaming:
        // We'll clear the current text if it was empty, or append if not? 
        // User usually wants to "Help me write this".
        
        // Let's assume we replace the content for now or append to it.
        const startText = value ? String(value) + '\n' : '';
        let currentText = startText;

        for await (const chunk of stream.textStream) {
            generatedText += chunk;
            currentText = startText + generatedText;
            
            // Create a synthetic event
            const event = {
                target: { value: currentText }
            } as React.ChangeEvent<HTMLTextAreaElement>;
            
            if (onChange) onChange(event);
        }

      } catch (error) {
        console.error("AI Generation Error:", error);
        alert("Failed to generate text. Check API keys.");
      } finally {
        setIsGenerating(false);
      }
    };

    return (
      <div className="relative group">
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...props}
        />
        
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className={cn(
            "absolute bottom-2 right-2 p-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary transition-all duration-200",
            "hover:bg-primary/20 hover:scale-110 hover:opacity-100",
            "opacity-40 group-hover:opacity-100", // Semi-transparent by default, fully visible on hover
            isGenerating && "opacity-100 animate-pulse cursor-not-allowed"
          )}
          title="AI Assist"
        >
          {isGenerating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    );
  }
);

AITextArea.displayName = "AITextArea";
