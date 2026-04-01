import { RichTextEditor } from "../RichTextEditor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlogPost } from "@/types/blog";

interface ConclusionSectionProps {
  post: BlogPost;
  onUpdateSection: (sectionName: keyof BlogPost["sections"], updates: any) => void;
}

export function ConclusionSection({
  post,
  onUpdateSection,
}: ConclusionSectionProps) {
  const title = post.primaryKeyword
    ? `Conclusion: ${post.primaryKeyword} & Moving Forward`
    : "Conclusion & Moving Forward";

  return (
    <div className="space-y-6 pb-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Section Title (Auto-Generated):</strong>
          <br />
          <code className="bg-blue-100 px-2 py-1 rounded text-xs">{title}</code>
        </p>
      </div>

      <RichTextEditor
        label="Conclusion Summary"
        value={post.sections.conclusion.content}
        onChange={(value) =>
          onUpdateSection("conclusion", { content: value })
        }
        minWords={100}
        maxWords={150}
        required={true}
        helpText="Wrap up your blog post with a summary of key points and final thoughts."
        placeholder="Summarize the key takeaways and provide final insights..."
        rows={5}
        showWordCount={true}
      />

      <div>
        <Label className="text-base font-semibold mb-2 block">
          Call-to-Action (CTA) <span className="text-gray-400">(Optional)</span>
        </Label>
        <p className="text-sm text-gray-600 mb-3">
          Guide readers on what to do next (e.g., 'Learn more', 'Get started', 'Contact us').
        </p>
        <Input
          type="text"
          placeholder="What should readers do next? (e.g., 'Start your free trial today')"
          value={post.sections.conclusion.cta}
          onChange={(e) =>
            onUpdateSection("conclusion", { cta: e.target.value })
          }
        />
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-900">
          <strong>⚠️ Restrictions:</strong> No headings or images allowed in conclusion.
          This is your final text message to the reader.
        </p>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
        <p className="text-sm text-blue-900">
          <strong>💡 Conclusion Best Practices:</strong>
        </p>
        <ul className="text-sm text-blue-800 space-y-1 ml-4">
          <li>• Summarize the main points covered in your post</li>
          <li>• Reiterate the importance of your topic</li>
          <li>• Provide a clear next step or CTA</li>
          <li>• End on a positive, inspiring note</li>
          <li>• Keep it between 100-150 words</li>
        </ul>
      </div>

      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-900">
          <strong>✓ Example:</strong> "Understanding the fundamentals of digital
          marketing is essential in today's competitive landscape. By implementing
          the strategies outlined in this guide—from SEO optimization to social media
          marketing—you'll be well-equipped to reach your target audience and grow your
          business. Ready to take your marketing to the next level? Start with our
          free course or contact our team for personalized guidance."
        </p>
      </div>
    </div>
  );
}
