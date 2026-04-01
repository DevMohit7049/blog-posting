import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Info } from "lucide-react";
import type { BlogPost } from "@/types/blog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

interface KeywordSetupSectionProps {
  post: BlogPost;
  onUpdatePost: (updates: Partial<BlogPost>) => void;
}

export function KeywordSetupSection({ post, onUpdatePost }: KeywordSetupSectionProps) {
  const [secondaryKeywordInput, setSecondaryKeywordInput] = useState("");

  const handleAddSecondaryKeyword = () => {
    if (secondaryKeywordInput.trim() && !post.secondaryKeywords.includes(secondaryKeywordInput)) {
      onUpdatePost({
        secondaryKeywords: [...post.secondaryKeywords, secondaryKeywordInput.trim()],
      });
      setSecondaryKeywordInput("");
    }
  };

  const handleRemoveSecondaryKeyword = (keyword: string) => {
    onUpdatePost({
      secondaryKeywords: post.secondaryKeywords.filter((k) => k !== keyword),
    });
  };

  const handleLockKeyword = () => {
    if (post.primaryKeyword.trim()) {
      onUpdatePost({ keywordLocked: true });
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div>
        <Label className="text-base font-semibold mb-2 block">
          Primary Keyword{" "}
          <span className="text-red-500">*</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 inline ml-1 cursor-help text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              This is the main topic of your blog post. It will be used throughout
              the post for SEO optimization. Once locked, it cannot be changed.
            </TooltipContent>
          </Tooltip>
        </Label>
        <p className="text-sm text-gray-600 mb-3">
          The main topic or keyword your blog post will focus on. Example: "SEO
          optimization", "content marketing", etc.
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter primary keyword (e.g., 'digital marketing')"
            value={post.primaryKeyword}
            onChange={(e) => {
              if (!post.keywordLocked) {
                onUpdatePost({ primaryKeyword: e.target.value });
              }
            }}
            disabled={post.keywordLocked}
            className="flex-1"
          />
          {!post.keywordLocked && post.primaryKeyword.trim() && (
            <Button
              onClick={handleLockKeyword}
              variant="outline"
              className="px-4"
            >
              Lock
            </Button>
          )}
          {post.keywordLocked && (
            <div className="px-4 py-2 bg-green-50 text-green-700 rounded-md font-medium text-sm flex items-center gap-2">
              ✓ Locked
            </div>
          )}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold mb-2 block">
          Secondary Keywords{" "}
          <span className="text-gray-400">(Optional)</span>
        </Label>
        <p className="text-sm text-gray-600 mb-3">
          Supporting keywords or related topics that complement your primary keyword.
        </p>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter a secondary keyword..."
              value={secondaryKeywordInput}
              onChange={(e) => setSecondaryKeywordInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddSecondaryKeyword();
                }
              }}
              disabled={!post.primaryKeyword}
            />
            <Button
              onClick={handleAddSecondaryKeyword}
              disabled={!secondaryKeywordInput.trim() || !post.primaryKeyword}
              variant="outline"
            >
              Add
            </Button>
          </div>

          {post.secondaryKeywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.secondaryKeywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="pl-3 pr-1 py-1">
                  {keyword}
                  <button
                    onClick={() => handleRemoveSecondaryKeyword(keyword)}
                    className="ml-2 hover:bg-gray-300 rounded p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>💡 Tip:</strong> Your primary keyword will appear in the blog title,
          featured image description, and key section headings. Lock it now to get
          started with the rest of your blog.
        </p>
      </div>
    </div>
  );
}
