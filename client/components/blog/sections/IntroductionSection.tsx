import { RichTextEditor } from "../RichTextEditor";
import type { BlogPost } from "@/types/blog";

interface IntroductionSectionProps {
  post: BlogPost;
  onUpdatePost: (updates: Partial<BlogPost>) => void;
}

export function IntroductionSection({ post, onUpdatePost }: IntroductionSectionProps) {
  return (
    <div className="space-y-6 pb-6">
      <RichTextEditor
        label="Introductory Paragraph"
        value={post.introduction}
        onChange={(value) => onUpdatePost({ introduction: value })}
        minWords={120}
        maxWords={180}
        required={true}
        helpText="Write a compelling introduction that hooks the reader. This appears right after your featured image and before the main content sections."
        placeholder="Write your introduction here. Hook the reader and set up what they'll learn..."
        rows={6}
        showWordCount={true}
      />

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-900">
          <strong>⚠️ Restrictions:</strong> No headings or images allowed in this section.
          Keep it as plain text only.
        </p>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
        <p className="text-sm text-blue-900">
          <strong>💡 Introduction Best Practices:</strong>
        </p>
        <ul className="text-sm text-blue-800 space-y-1 ml-4">
          <li>• Start with an interesting hook or question</li>
          <li>• Briefly summarize what the reader will learn</li>
          <li>• Keep it between 120-180 words</li>
          <li>• Make it clear and easy to understand</li>
          <li>• Consider including your primary keyword naturally</li>
        </ul>
      </div>

      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-900">
          <strong>✓ Example:</strong> "If you're looking to improve your website's
          visibility in search results, you've come to the right place. In this guide,
          we'll walk you through the essential strategies for SEO optimization that
          will help your website rank higher and attract more organic traffic. Whether
          you're a beginner or experienced marketer, you'll find actionable tips you
          can start implementing today."
        </p>
      </div>
    </div>
  );
}
