import { RichTextEditor } from "../RichTextEditor";
import { ImageUploadField } from "../ImageUploadField";
import { suggestAltText } from "@/lib/blog-validation";
import type { BlogPost } from "@/types/blog";

interface WhatIsSectionProps {
  post: BlogPost;
  onUpdateSection: (sectionName: keyof BlogPost["sections"], updates: any) => void;
}

export function WhatIsSection({ post, onUpdateSection }: WhatIsSectionProps) {
  const title = post.primaryKeyword
    ? `What Is ${post.primaryKeyword} and Why It Matters Today`
    : "What Is [Keyword] and Why It Matters Today";

  return (
    <div className="space-y-6 pb-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Section Title (Auto-Generated):</strong>
          <br />
          <code className="bg-blue-100 px-2 py-1 rounded text-xs">{title}</code>
          <br />
          <span className="text-xs mt-2 block">
            This title is automatically created based on your primary keyword. You
            cannot edit it.
          </span>
        </p>
      </div>

      <RichTextEditor
        label="Content"
        value={post.sections.whatIs.content}
        onChange={(value) => onUpdateSection("whatIs", { content: value })}
        required={true}
        helpText="Explain what your primary keyword means and why it's important. Include 2-3 short paragraphs."
        placeholder="Define your keyword and explain its importance..."
        rows={6}
        showWordCount={true}
      />

      {post.sections.whatIs.content.trim() && (
        <>
          <div className="border-t pt-6">
            <ImageUploadField
              label="Section Image (Optional)"
              value={post.sections.whatIs.image}
              onChange={(imageData) =>
                onUpdateSection("whatIs", {
                  image: {
                    ...imageData,
                    alt:
                      imageData.alt ||
                      suggestAltText("whatIs", post.primaryKeyword),
                  },
                })
              }
              suggestedAltText={suggestAltText("whatIs", post.primaryKeyword)}
              helpText="Add an optional image to illustrate this concept."
            />
          </div>
        </>
      )}

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
        <p className="text-sm text-blue-900">
          <strong>💡 Tips:</strong>
        </p>
        <ul className="text-sm text-blue-800 space-y-1 ml-4">
          <li>• Provide a clear, comprehensive definition</li>
          <li>• Explain the relevance to today's context</li>
          <li>• Use simple language that anyone can understand</li>
          <li>• Include your primary keyword naturally</li>
        </ul>
      </div>
    </div>
  );
}
