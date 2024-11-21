import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, MapPin, Briefcase, NewspaperIcon } from "lucide-react";
import { ContentActions } from "./ContentActions";
import ReactMarkdown from "react-markdown";

interface ContentItemProps {
  item: any;
  onSelect: () => void;
  onEdit: (content: string) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const ContentItem = ({ item, onSelect, onEdit, onDelete }: ContentItemProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "service":
        return <Briefcase className="h-5 w-5 text-primary" />;
      case "location":
        return <MapPin className="h-5 w-5 text-secondary" />;
      case "blog":
        return <NewspaperIcon className="h-5 w-5 text-success" />;
      default:
        return <FileText className="h-5 w-5 text-neutral-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "generated":
        return "bg-success";
      case "pending":
        return "bg-primary";
      case "error":
        return "bg-secondary";
      default:
        return "bg-neutral-400";
    }
  };

  return (
    <Card
      className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 hover:border-l-primary animate-fade-in group"
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getIcon(item.type)}
          <div>
            <h3 className="font-medium text-lg">{item.title}</h3>
            <p className="text-sm text-neutral-500">
              {item.companies?.name} • {new Date(item.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {item.type}
          </Badge>
          <div
            className={`h-2 w-2 rounded-full ${getStatusColor(item.status)}`}
          />
          <ContentActions
            content={item.content}
            contentId={item.id}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>
      <div className="hidden">
        <div data-rendered-content-id={item.id} className="prose prose-lg prose-primary">
          <ReactMarkdown>{item.content}</ReactMarkdown>
        </div>
      </div>
    </Card>
  );
};