import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BlogPost } from "@/types/blog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface H1TitleSectionProps {
  post: BlogPost;
  onUpdatePost: (updates: Partial<BlogPost>) => void;
}

export function H1TitleSection({ post, onUpdatePost }: H1TitleSectionProps) {
  const titleLength = post.h1Title.length;
  const recommendedLength = 50;
  const isOptimal = titleLength >= 50 && titleLength <= 70;
  const hasKeyword = post.primaryKeyword && post.h1Title.toLowerCase().includes(post.primaryKeyword.toLowerCase());

  return (
    <div className="space-y-6 pb-6">
      <div>
        <Label className="text-base font-semibold mb-2 block">
          Blog Title (H1) <span className="text-red-500">*</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 inline ml-1 cursor-help text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              This is your main heading (H1). It should include your primary keyword
              and be compelling to readers. Only one H1 allowed per post.
            </TooltipContent>
          </Tooltip>
        </Label>
        <p className="text-sm text-gray-600 mb-3">
          Write a clear, descriptive title that includes your primary keyword.
          Aim for 50-70 characters.
        </p>
        <Textarea
          placeholder="Enter your blog title here..."
          value={post.h1Title}
          onChange={(e) => onUpdatePost({ h1Title: e.target.value })}
          className="mb-3"
          rows={3}
        />

        {/* Character Count */}
        <div className="flex justify-between items-center text-sm mb-4">
          <span className={isOptimal ? "text-green-600" : "text-gray-600"}>
            {titleLength} characters
          </span>
          <span className="text-gray-500">
            Recommended: {recommendedLength}-70 characters
          </span>
        </div>

        {/* Validation Indicators */}
        <div className="space-y-2 mb-4">
          {post.h1Title && !isOptimal && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-2 rounded">
              <AlertCircle className="w-4 h-4" />
              Title length could be optimized ({titleLength} characters vs recommended 50-70)
            </div>
          )}

          {post.primaryKeyword && !hasKeyword && post.h1Title && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-2 rounded">
              <AlertCircle className="w-4 h-4" />
              Primary keyword "{post.primaryKeyword}" not found in title. Consider including it for SEO.
            </div>
          )}

          {hasKeyword && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
              <CheckCircle2 className="w-4 h-4" />
              Great! Primary keyword is included.
            </div>
          )}

          {isOptimal && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
              <CheckCircle2 className="w-4 h-4" />
              Optimal length!
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>📌 Important:</strong> You can only have one H1 per blog post.
          This is your main title. Think of it as the headline readers see first.
        </p>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>💡 Examples:</strong>
          <br />
          ✓ "Complete Guide to Digital Marketing Strategies in 2024"
          <br />
          ✓ "SEO Optimization: How to Rank Your Website Higher"
          <br />
          ✓ "Content Marketing 101: Everything You Need to Know"
        </p>
      </div>
    </div>
  );
}
