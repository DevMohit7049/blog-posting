import { useState, useEffect, useRef } from "react";
import type { BlogPost, ValidationState } from "@/types/blog";
import { validateBlogPost, generateSlug } from "@/lib/blog-validation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Eye } from "lucide-react";
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

interface BlogEditorSinglePageProps {
  post: BlogPost;
  validation: ValidationState;
  onUpdatePost: (updates: Partial<BlogPost>) => void;
  onUpdateSection: (sectionName: keyof BlogPost["sections"], updates: any) => void;
  onValidationChange: (validation: ValidationState) => void;
}

const SECTIONS = [
  { id: "keyword", label: "Primary Keyword & Meta Title", icon: "1" },
  { id: "h1", label: "H1 - Main Blog Title", icon: "2" },
  { id: "image", label: "Featured Image", icon: "3" },
  { id: "intro", label: "Introduction Paragraph", icon: "4" },
  { id: "whatis", label: "H2 - What Is & Definition", icon: "5" },
  { id: "benefits", label: "H2 - Benefits & Value", icon: "6" },
  { id: "types", label: "H2 - Types & Options", icon: "7" },
  { id: "howitworks", label: "H2 - How It Works", icon: "8" },
  { id: "usecases", label: "H2 - Use Cases", icon: "9" },
  { id: "brand", label: "H2 - Brand Promotion", icon: "10" },
  { id: "faqs", label: "H2 - FAQs", icon: "11" },
  { id: "conclusion", label: "H2 - Conclusion", icon: "12" },
];

export function BlogEditorSinglePage({
  post,
  validation,
  onUpdatePost,
  onUpdateSection,
  onValidationChange,
}: BlogEditorSinglePageProps) {
  const prevPostRef = useRef<BlogPost | null>(null);
  const [currentSection, setCurrentSection] = useState(0);

  // Validate and update derived fields
  useEffect(() => {
    const newValidation = validateBlogPost(post);
    onValidationChange(newValidation);

    // Update slug if h1Title changed
    if (post.h1Title && prevPostRef.current?.h1Title !== post.h1Title) {
      const newSlug = generateSlug(post.h1Title);
      if (newSlug !== post.slug) {
        onUpdatePost({ slug: newSlug });
      }
    }

    // Update meta description if intro changed and metaDescription is empty
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

    prevPostRef.current = post;
  }, [post]);

  const isSectionComplete = (sectionName: string) => {
    return validation.completedSections.includes(sectionName);
  };

  const getSectionCompletion = (sectionId: string) => {
    const mappings: Record<string, string> = {
      keyword: "Keyword Setup",
      h1: "Blog Title",
      image: "Featured Image",
      intro: "Introduction",
      whatis: "What Is Section",
      benefits: "Benefits Section",
      types: "Types Section",
      howitworks: "How It Works",
      usecases: "Use Cases",
      brand: "Brand Promotion",
      faqs: "FAQs",
      conclusion: "Conclusion",
    };
    return isSectionComplete(mappings[sectionId]);
  };

  const scrollToSection = (index: number) => {
    setCurrentSection(index);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Sidebar - Section Navigation */}
      <div className="lg:col-span-1">
        <div className="sticky top-8 space-y-2">
          <h3 className="font-semibold text-gray-900 mb-4">Blog Structure</h3>
          <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {SECTIONS.map((section, idx) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(idx)}
                className={`w-full text-left px-4 py-3 rounded-lg border-l-4 transition-all text-sm font-medium flex items-start gap-3 ${
                  currentSection === idx
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : getSectionCompletion(section.id)
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <span className="font-semibold mt-0.5 text-xs">{section.icon}</span>
                <div className="flex-1">
                  <div>{section.label}</div>
                  {getSectionCompletion(section.id) && (
                    <CheckCircle2 className="h-3 w-3 inline mt-0.5" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* View Preview Button */}
          <div className="mt-6 pt-6 border-t">
            <Button variant="outline" className="w-full gap-2" asChild>
              <a href="/blog/preview" target="_blank">
                <Eye className="w-4 h-4" />
                View Full Preview
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Right Content - Form Sections */}
      <div className="lg:col-span-3 space-y-12">
        {/* Section 1: Keyword & Meta Title */}
        <div className="scroll-mt-20" id="section-keyword">
          <div className="mb-6 pb-6 border-b-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                1
              </span>
              Primary Keyword & Meta Title
            </h2>
            <p className="text-gray-600 mt-2">Foundation for SEO optimization</p>
          </div>
          <KeywordSetupSection post={post} onUpdatePost={onUpdatePost} />
        </div>

        {/* Section 2: H1 Title */}
        <div className="scroll-mt-20" id="section-h1">
          <div className="mb-6 pb-6 border-b-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                2
              </span>
              H1 - Main Blog Title
            </h2>
            <p className="text-gray-600 mt-2">Your primary headline with keyword focus</p>
          </div>
          <H1TitleSection post={post} onUpdatePost={onUpdatePost} />
        </div>

        {/* Section 3: Featured Image */}
        <div className="scroll-mt-20" id="section-image">
          <div className="mb-6 pb-6 border-b-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                3
              </span>
              Featured Image
            </h2>
            <p className="text-gray-600 mt-2">1200×628 landscape image, place below H1</p>
          </div>
          <FeaturedImageSection post={post} onUpdatePost={onUpdatePost} />
        </div>

        {/* Section 4: Introduction */}
        <div className="scroll-mt-20" id="section-intro">
          <div className="mb-6 pb-6 border-b-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                4
              </span>
              Introduction Paragraph
            </h2>
            <p className="text-gray-600 mt-2">Define problem, introduce solution (120-180 words)</p>
          </div>
          <IntroductionSection post={post} onUpdatePost={onUpdatePost} />
        </div>

        {/* Section 5: What Is & Definition */}
        <div className="scroll-mt-20" id="section-whatis">
          <div className="mb-6 pb-6 border-b-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                5
              </span>
              H2 - What Is & Definition
            </h2>
            <p className="text-gray-600 mt-2">What Is [Primary Keyword] and Why It Matters Today</p>
          </div>
          <WhatIsSection post={post} onUpdateSection={onUpdateSection} />
        </div>

        {/* Section 6: Benefits */}
        <div className="scroll-mt-20" id="section-benefits">
          <div className="mb-6 pb-6 border-b-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                6
              </span>
              H2 - Benefits & Value Proposition
            </h2>
            <p className="text-gray-600 mt-2">Key Benefits of Using [Primary Keyword]</p>
          </div>
          <BenefitsSection post={post} onUpdateSection={onUpdateSection} />
        </div>

        {/* Section 7: Types */}
        <div className="scroll-mt-20" id="section-types">
          <div className="mb-6 pb-6 border-b-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                7
              </span>
              H2 - Types & Options
            </h2>
            <p className="text-gray-600 mt-2">Different Types of [Primary Keyword] You Can Choose From</p>
          </div>
          <TypesSection post={post} onUpdateSection={onUpdateSection} />
        </div>

        {/* Section 8: How It Works */}
        <div className="scroll-mt-20" id="section-howitworks">
          <div className="mb-6 pb-6 border-b-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                8
              </span>
              H2 - How It Works / Process
            </h2>
            <p className="text-gray-600 mt-2">How [Primary Keyword] Works – Step-by-Step Process</p>
          </div>
          <HowItWorksSection post={post} onUpdateSection={onUpdateSection} />
        </div>

        {/* Section 9: Use Cases */}
        <div className="scroll-mt-20" id="section-usecases">
          <div className="mb-6 pb-6 border-b-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                9
              </span>
              H2 - Use Cases & Applications
            </h2>
            <p className="text-gray-600 mt-2">Where and When to Use [Primary Keyword]</p>
          </div>
          <UseCasesSection post={post} onUpdateSection={onUpdateSection} />
        </div>

        {/* Section 10: Brand Promotion */}
        <div className="scroll-mt-20" id="section-brand">
          <div className="mb-6 pb-6 border-b-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                10
              </span>
              H2 - Brand Promotion
            </h2>
            <p className="text-gray-600 mt-2">How [Brand Name] Can Help You with [Primary Keyword]</p>
          </div>
          <BrandPromotionSection post={post} onUpdateSection={onUpdateSection} />
        </div>

        {/* Section 11: FAQs */}
        <div className="scroll-mt-20" id="section-faqs">
          <div className="mb-6 pb-6 border-b-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                11
              </span>
              H2 - FAQs
            </h2>
            <p className="text-gray-600 mt-2">Frequently Asked Questions About [Primary Keyword]</p>
          </div>
          <FAQsSection post={post} onUpdateSection={onUpdateSection} />
        </div>

        {/* Section 12: Conclusion */}
        <div className="scroll-mt-20" id="section-conclusion">
          <div className="mb-6 pb-6 border-b-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                12
              </span>
              H2 - Conclusion
            </h2>
            <p className="text-gray-600 mt-2">Final Thoughts on Choosing the Right [Primary Keyword]</p>
          </div>
          <ConclusionSection post={post} onUpdateSection={onUpdateSection} />
        </div>

        {/* Publish Button */}
        <div className="sticky bottom-0 bg-white border-t pt-6 pb-6 flex gap-3">
          <Button size="lg" className="flex-1">
            Save & Publish
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="/blog/preview" target="_blank">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
