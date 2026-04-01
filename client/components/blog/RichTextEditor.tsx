import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { countWords } from "@/lib/blog-validation";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minWords?: number;
  maxWords?: number;
  helpText?: string;
  required?: boolean;
  rows?: number;
  showWordCount?: boolean;
}

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = "Enter text here...",
  minWords,
  maxWords,
  helpText,
  required = false,
  rows = 5,
  showWordCount = true,
}: RichTextEditorProps) {
  const wordCount = countWords(value);
  const isAboveMin = !minWords || wordCount >= minWords;
  const isBelowMax = !maxWords || wordCount <= maxWords;
  const isInRange = isAboveMin && isBelowMax;

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">
        {label}
        {required && <span className="text-red-500"> *</span>}
        {minWords || maxWords ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 inline ml-2 cursor-help text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              {minWords && maxWords
                ? `Recommended: ${minWords}-${maxWords} words`
                : minWords
                  ? `Minimum: ${minWords} words`
                  : `Maximum: ${maxWords} words`}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </Label>

      {helpText && <p className="text-sm text-gray-600">{helpText}</p>}

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="font-mono text-sm"
      />

      {/* Word Count and Validation */}
      <div className="space-y-2">
        {showWordCount && (minWords || maxWords) && (
          <div className="flex justify-between items-center text-sm">
            <span className={isInRange ? "text-green-600" : "text-gray-600"}>
              {wordCount} words
            </span>
            <span className="text-gray-500">
              {minWords && maxWords
                ? `${minWords}-${maxWords} words`
                : minWords
                  ? `Min: ${minWords}`
                  : `Max: ${maxWords}`}
            </span>
          </div>
        )}

        {/* Validation Messages */}
        {minWords && !isAboveMin && (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-2 rounded">
            <AlertCircle className="w-4 h-4" />
            Too short ({wordCount}/{minWords} words)
          </div>
        )}

        {maxWords && !isBelowMax && (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-2 rounded">
            <AlertCircle className="w-4 h-4" />
            Too long ({wordCount}/{maxWords} words)
          </div>
        )}

        {isInRange && (minWords || maxWords) && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
            <CheckCircle2 className="w-4 h-4" />
            Word count is good
          </div>
        )}
      </div>
    </div>
  );
}
