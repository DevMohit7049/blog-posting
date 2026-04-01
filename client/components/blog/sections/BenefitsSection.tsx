import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "../ImageUploadField";
import { suggestAltText } from "@/lib/blog-validation";
import { Plus, Trash2 } from "lucide-react";
import type { BlogPost, BenefitItem } from "@/types/blog";

interface BenefitsSectionProps {
  post: BlogPost;
  onUpdateSection: (sectionName: keyof BlogPost["sections"], updates: any) => void;
}

export function BenefitsSection({ post, onUpdateSection }: BenefitsSectionProps) {
  const title = post.primaryKeyword
    ? `${post.primaryKeyword} Benefits: Key Advantages You Need to Know`
    : "[Keyword] Benefits: Key Advantages You Need to Know";

  const handleAddBenefit = () => {
    onUpdateSection("benefits", {
      items: [...post.sections.benefits.items, { title: "", description: "" }],
    });
  };

  const handleUpdateBenefit = (index: number, item: BenefitItem) => {
    const items = [...post.sections.benefits.items];
    items[index] = item;
    onUpdateSection("benefits", { items });
  };

  const handleRemoveBenefit = (index: number) => {
    const items = post.sections.benefits.items.filter((_, i) => i !== index);
    onUpdateSection("benefits", { items });
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
        <div className="flex justify-between items-center mb-4">
          <Label className="text-base font-semibold">
            Benefits List <span className="text-red-500">*</span>
          </Label>
          <span className="text-sm text-gray-600">
            {post.sections.benefits.items.length} items
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Add 3-5 key benefits. Each benefit will be rendered as a bullet point in
          the preview.
        </p>

        {/* Benefits List */}
        <div className="space-y-4">
          {post.sections.benefits.items.map((benefit, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg space-y-3"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-600">
                  Benefit #{index + 1}
                </span>
                <Button
                  onClick={() => handleRemoveBenefit(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Benefit Title
                </Label>
                <Input
                  type="text"
                  placeholder="e.g., 'Saves Time and Money'"
                  value={benefit.title}
                  onChange={(e) =>
                    handleUpdateBenefit(index, {
                      ...benefit,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Description
                </Label>
                <Textarea
                  placeholder="Brief description (2-3 lines)..."
                  value={benefit.description}
                  onChange={(e) =>
                    handleUpdateBenefit(index, {
                      ...benefit,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
            </div>
          ))}
        </div>

        {post.sections.benefits.items.length < 5 && (
          <Button
            onClick={handleAddBenefit}
            variant="outline"
            className="w-full mt-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Benefit
          </Button>
        )}

        {post.sections.benefits.items.length === 0 && (
          <Button
            onClick={handleAddBenefit}
            className="w-full mt-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Benefit
          </Button>
        )}
      </div>

      {post.sections.benefits.items.length > 0 && (
        <div className="border-t pt-6">
          <ImageUploadField
            label="Benefits Section Image (Optional)"
            value={post.sections.benefits.image}
            onChange={(imageData) =>
              onUpdateSection("benefits", {
                image: {
                  ...imageData,
                  alt:
                    imageData.alt ||
                    suggestAltText("benefits", post.primaryKeyword),
                },
              })
            }
            suggestedAltText={suggestAltText("benefits", post.primaryKeyword)}
            helpText="Add an optional image that illustrates the benefits."
          />
        </div>
      )}

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
        <p className="text-sm text-blue-900">
          <strong>💡 Tips:</strong>
        </p>
        <ul className="text-sm text-blue-800 space-y-1 ml-4">
          <li>• Focus on what makes your topic valuable</li>
          <li>• Use action-oriented language (improve, increase, save, etc.)</li>
          <li>• Keep descriptions concise and scannable</li>
          <li>• Add 3-5 benefits for best impact</li>
        </ul>
      </div>
    </div>
  );
}
