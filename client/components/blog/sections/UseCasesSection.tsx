import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "../ImageUploadField";
import { suggestAltText } from "@/lib/blog-validation";
import type { BlogPost, UseCaseItem } from "@/types/blog";

interface UseCasesSectionProps {
  post: BlogPost;
  onUpdateSection: (sectionName: keyof BlogPost["sections"], updates: any) => void;
}

export function UseCasesSection({ post, onUpdateSection }: UseCasesSectionProps) {
  const title = post.primaryKeyword
    ? `${post.primaryKeyword} Use Cases: Real-World Applications`
    : "[Keyword] Use Cases: Real-World Applications";

  const handleUpdateUseCase = (index: number, item: UseCaseItem) => {
    const items = [...post.sections.useCases.items];
    items[index] = item;
    onUpdateSection("useCases", { items });
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Section Title (Auto-Generated):</strong>
          <br />
          <code className="bg-blue-100 px-2 py-1 rounded text-xs">{title}</code>
        </p>
      </div>

      <div>
        <Label className="text-base font-semibold mb-2 block">
          Use Case Categories <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-600 mb-4">
          Pre-defined categories for real-world use cases. Fill in descriptions for
          each.
        </p>

        <div className="space-y-6">
          {post.sections.useCases.items.map((useCase, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600 block mb-2">
                  Category (H3): {useCase.title}
                </span>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Description (80-120 words)
                </Label>
                <Textarea
                  placeholder="Describe this use case..."
                  value={useCase.description}
                  onChange={(e) =>
                    handleUpdateUseCase(index, {
                      ...useCase,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <ImageUploadField
          label="Use Cases Image (Optional)"
          value={post.sections.useCases.image}
          onChange={(imageData) =>
            onUpdateSection("useCases", {
              image: {
                ...imageData,
                alt:
                  imageData.alt ||
                  suggestAltText("useCases", post.primaryKeyword),
              },
            })
          }
          suggestedAltText={suggestAltText("useCases", post.primaryKeyword)}
          helpText="Add an optional image that shows real-world applications."
        />
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
        <p className="text-sm text-blue-900">
          <strong>💡 Tips:</strong>
        </p>
        <ul className="text-sm text-blue-800 space-y-1 ml-4">
          <li>• Provide specific, relatable examples</li>
          <li>• Cover different contexts (personal, business, specialized)</li>
          <li>• Show practical applications readers can relate to</li>
          <li>• Keep descriptions concise but detailed</li>
        </ul>
      </div>
    </div>
  );
}
