import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import type { BlogPost } from "@/types/blog";
import { useState } from "react";

interface BrandPromotionSectionProps {
  post: BlogPost;
  onUpdateSection: (sectionName: keyof BlogPost["sections"], updates: any) => void;
}

export function BrandPromotionSection({
  post,
  onUpdateSection,
}: BrandPromotionSectionProps) {
  const [bulletInput, setBulletInput] = useState("");
  const isEnabled = post.sections.brandPromotion.enabled;

  const handleToggle = () => {
    onUpdateSection("brandPromotion", {
      enabled: !isEnabled,
    });
  };

  const handleAddBullet = () => {
    if (bulletInput.trim()) {
      onUpdateSection("brandPromotion", {
        uspBullets: [
          ...post.sections.brandPromotion.uspBullets,
          bulletInput.trim(),
        ],
      });
      setBulletInput("");
    }
  };

  const handleRemoveBullet = (index: number) => {
    onUpdateSection("brandPromotion", {
      uspBullets: post.sections.brandPromotion.uspBullets.filter(
        (_, i) => i !== index
      ),
    });
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div>
          <Label className="text-base font-semibold block">
            Include Brand Promotion Section?
          </Label>
          <p className="text-sm text-gray-600 mt-1">
            Add an optional section to promote your brand, product, or service.
          </p>
        </div>
        <Switch checked={isEnabled} onCheckedChange={handleToggle} />
      </div>

      {isEnabled && (
        <>
          <div>
            <Label className="text-base font-semibold mb-2 block">
              Brand Name
            </Label>
            <Input
              type="text"
              placeholder="Your brand or company name..."
              value={post.sections.brandPromotion.brandName}
              onChange={(e) =>
                onUpdateSection("brandPromotion", {
                  brandName: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label className="text-base font-semibold mb-2 block">
              Unique Selling Propositions (USPs)
            </Label>
            <p className="text-sm text-gray-600 mb-3">
              Add 3-5 key points about what makes your brand special.
            </p>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Add a unique selling point..."
                  value={bulletInput}
                  onChange={(e) => setBulletInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddBullet();
                    }
                  }}
                />
                <Button onClick={handleAddBullet} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {post.sections.brandPromotion.uspBullets.length > 0 && (
                <div className="space-y-2">
                  {post.sections.brandPromotion.uspBullets.map(
                    (bullet, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded"
                      >
                        <span className="text-sm text-gray-700">• {bullet}</span>
                        <button
                          onClick={() => handleRemoveBullet(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-2 block">
              Call-to-Action (CTA)
            </Label>
            <Textarea
              placeholder="Enter your call-to-action text (e.g., 'Learn more about our service' or 'Get started today')"
              value={post.sections.brandPromotion.cta}
              onChange={(e) =>
                onUpdateSection("brandPromotion", {
                  cta: e.target.value,
                })
              }
              rows={3}
            />
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <p className="text-sm text-blue-900">
              <strong>💡 Tips:</strong>
            </p>
            <ul className="text-sm text-blue-800 space-y-1 ml-4">
              <li>• Keep it brief and relevant to your blog content</li>
              <li>• Focus on benefits, not just features</li>
              <li>• Use a clear, compelling CTA</li>
              <li>• This section appears before FAQs</li>
            </ul>
          </div>
        </>
      )}

      {!isEnabled && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            Brand Promotion section is currently disabled. Toggle above to enable it.
          </p>
        </div>
      )}
    </div>
  );
}
