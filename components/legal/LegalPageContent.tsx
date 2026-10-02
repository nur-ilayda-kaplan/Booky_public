import ReactMarkdown from "react-markdown";
import { PageContainer } from "@/components/layout/PageContainer";

export function LegalPageContent({ title, content }: { title: string; content: string }) {
  return (
    <PageContainer className="py-12">
      <article className="max-w-3xl">
        <h1 className="font-serif text-3xl font-semibold sm:text-4xl">{title}</h1>
        <div className="prose prose-lg prose-neutral mt-8 max-w-none prose-headings:font-serif">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </article>
    </PageContainer>
  );
}
