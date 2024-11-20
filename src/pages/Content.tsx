import Layout from "@/components/Layout";
import ContentList from "@/components/ContentList";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentData } from "@/hooks/useContentData";

const Content = () => {
  const { data: content, isLoading } = useContentData();

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Saved Content</h1>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <ContentList items={content} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Content;