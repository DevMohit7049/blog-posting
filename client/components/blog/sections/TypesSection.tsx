import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "../ImageUploadField";
import { suggestAltText } from "@/lib/blog-validation";
import type { BlogPost, TypeItem } from "@/types/blog";

interface TypesSectionProps {
  post: BlogPost;
  onUpdateSection: (sectionName: keyof BlogPost["sections"], updates: any) => void;
}

export function TypesSection({ post, onUpdateSection }: TypesSectionProps) {
  const title = post.primaryKeyword
    ? `${post.primaryKeyword} Types: A Comprehensive Breakdown`
    : "[Keyword] Types: A Comprehensive Breakdown";

  const handleUpdateType = (index: number, item: TypeItem) => {
    const items = [...post.sections.types.items];
    items[index] = item;
    onUpdateSection("types", { items });
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
          Three Types <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-600 mb-4">
          Define three main types or variations of your keyword. Each will be an H3
          heading.
        </p>

        <div className="space-y-6">
          {post.sections.types.items.map((type, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  Type #{index + 1} (H3)
                </span>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Title</Label>
                <Input
                  type="text"
                  placeholder="Type name..."
                  value={type.title}
                  onChange={(e) =>
                    handleUpdateType(index, { ...type, title: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Description (80-120 words)
                </Label>
                <Textarea
                  placeholder="Describe this type..."
                  value={type.description}
                  onChange={(e) =>
                    handleUpdateType(index, {
                      ...type,
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
          label="Comparison Image (Optional)"
          value={post.sections.types.comparisonImage}
          onChange={(imageData) =>
            onUpdateSection("types", {
              comparisonImage: {
                ...imageData,
                alt:
                  imageData.alt ||
                  suggestAltText("types", post.primaryKeyword),
              },
            })
          }
          suggestedAltText={suggestAltText("types", post.primaryKeyword)}
          helpText="Add an optional comparison image showing the different types."
        />
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
        <p className="text-sm text-blue-900">
          <strong>💡 Tips:</strong>
        </p>
        <ul className="text-sm text-blue-800 space-y-1 ml-4">
          <li>• Choose three main categories within your topic</li>
          <li>• Describe each type clearly and distinctly</li>
          <li>• Keep descriptions between 80-120 words</li>
          <li>• Make comparisons easy to understand</li>
        </ul>
      </div>
    </div>
  );
}
