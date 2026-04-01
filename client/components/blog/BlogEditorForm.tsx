import { useState, useEffect, useRef } from "react";
import type { BlogPost, ValidationState } from "@/types/blog";
import { validateBlogPost, generateSlug } from "@/lib/blog-validation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { KeywordSetupSection } from "./sections/KeywordSetupSection";
import { H1TitleSection } from "./sections/H1TitleSection";
import { FeaturedImageSection } from "./sections/FeaturedImageSection";
import { IntroductionSection } from "./sections/IntroductionSection";
import { WhatIsSection } from "./sections/WhatIsSection";
import { BenefitsSection } from "./sections/BenefitsSection";
import { TypesSection } from "./sections/TypesSection";
import { HowItWorksSection } from "./sections/HowItWorksSection";
import { UseCasesSection } from "./sections/UseCasesSection";
import { BrandPromotionSection } from "./sections/BrandPromotionSection";
import { FAQsSection } from "./sections/FAQsSection";
import { ConclusionSection } from "./sections/ConclusionSection";
import { CheckCircle2 } from "lucide-react";

interface BlogEditorFormProps {
  post: BlogPost;
  validation: ValidationState;
  onUpdatePost: (updates: Partial<BlogPost>) => void;
  onUpdateSection: (sectionName: keyof BlogPost["sections"], updates: any) => void;
  onValidationChange: (validation: ValidationState) => void;
}

export function BlogEditorForm({
  post,
  validation,
  onUpdatePost,
  onUpdateSection,
  onValidationChange,
}: BlogEditorFormProps) {
  const [activeSection, setActiveSection] = useState<string>("keyword-setup");
  const prevPostRef = useRef<BlogPost | null>(null);

  // Single effect that validates and updates derived fields on specific field changes
  useEffect(() => {
    // Always validate
    const newValidation = validateBlogPost(post);
    onValidationChange(newValidation);

    // Only update slug if h1Title actually changed
    if (post.h1Title && prevPostRef.current?.h1Title !== post.h1Title) {
      const newSlug = generateSlug(post.h1Title);
      if (newSlug !== post.slug) {
        onUpdatePost({ slug: newSlug });
      }
    }

    // Only update meta description if intro changed and metaDescription is empty
    if (
      post.introduction &&
      !post.metaDescription &&
      prevPostRef.current?.introduction !== post.introduction
    ) {
      const introText = post.introduction
        .replace(/<[^>]*>/g, "")
        .substring(0, 150);
      onUpdatePost({ metaDescription: introText });
    }

    // Update ref after processing
    prevPostRef.current = post;
  }, [post]);

  const isSectionComplete = (sectionName: string) => {
    return validation.completedSections.includes(sectionName);
  };

  const getSectionStatus = (sectionName: string) => {
    if (isSectionComplete(sectionName)) {
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible value={activeSection} onValueChange={setActiveSection}>
        {/* Step 1: Keyword Setup */}
        <AccordionItem value="keyword-setup">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                1
              </span>
              <span className="text-left">
                Primary Keyword Setup
                {getSectionStatus("Keyword Setup")}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-0">
            <KeywordSetupSection
              post={post}
              onUpdatePost={onUpdatePost}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Step 2: H1 Title */}
        <AccordionItem value="h1-title">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                2
              </span>
              <span className="text-left">
                Blog Title (H1)
                {getSectionStatus("Blog Title")}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-0">
            <H1TitleSection
              post={post}
              onUpdatePost={onUpdatePost}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Step 3: Featured Image */}
        <AccordionItem value="featured-image">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                3
              </span>
              <span className="text-left">
                Featured Image
                {getSectionStatus("Featured Image")}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-0">
            <FeaturedImageSection
              post={post}
              onUpdatePost={onUpdatePost}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Step 4: Introduction */}
        <AccordionItem value="introduction">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                4
              </span>
              <span className="text-left">
                Introduction
                {getSectionStatus("Introduction")}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-0">
            <IntroductionSection
              post={post}
              onUpdatePost={onUpdatePost}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Step 5: What Is Section */}
        <AccordionItem value="what-is">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                5
              </span>
              <span className="text-left">
                What Is & Definition
                {getSectionStatus("What Is Section")}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-0">
            <WhatIsSection
              post={post}
              onUpdateSection={onUpdateSection}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Step 6: Benefits */}
        <AccordionItem value="benefits">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                6
              </span>
              <span className="text-left">
                Benefits & Advantages
                {getSectionStatus("Benefits Section")}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-0">
            <BenefitsSection
              post={post}
              onUpdateSection={onUpdateSection}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Step 7: Types */}
        <AccordionItem value="types">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                7
              </span>
              <span className="text-left">
                Types & Variations
                {getSectionStatus("Types Section")}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-0">
            <TypesSection
              post={post}
              onUpdateSection={onUpdateSection}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Step 8: How It Works */}
        <AccordionItem value="how-it-works">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                8
              </span>
              <span className="text-left">
                How It Works / Process
                {getSectionStatus("How It Works")}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-0">
            <HowItWorksSection
              post={post}
              onUpdateSection={onUpdateSection}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Step 9: Use Cases */}
        <AccordionItem value="use-cases">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                9
              </span>
              <span className="text-left">
                Use Cases & Applications
                {getSectionStatus("Use Cases")}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-0">
            <UseCasesSection
              post={post}
              onUpdateSection={onUpdateSection}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Step 10: Brand Promotion */}
        <AccordionItem value="brand-promotion">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                10
              </span>
              <span className="text-left">
                Brand Promotion (Optional)
                {getSectionStatus("Brand Promotion (Skipped)") || getSectionStatus("Brand Promotion")}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-0">
            <BrandPromotionSection
              post={post}
              onUpdateSection={onUpdateSection}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Step 11: FAQs */}
        <AccordionItem value="faqs">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                11
              </span>
              <span className="text-left">
                FAQs
                {getSectionStatus("FAQs")}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-0">
            <FAQsSection
              post={post}
              onUpdateSection={onUpdateSection}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Step 12: Conclusion */}
        <AccordionItem value="conclusion">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                12
              </span>
              <span className="text-left">
                Conclusion
                {getSectionStatus("Conclusion")}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-0">
            <ConclusionSection
              post={post}
              onUpdateSection={onUpdateSection}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
