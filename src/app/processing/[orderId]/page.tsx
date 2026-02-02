import { ProcessingStatus } from "@/components/ProcessingStatus";
import { Badge } from "@/components/ui/badge";

export default async function ProcessingPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = await params;

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            Step 2 of 3
          </Badge>
        </div>

        <ProcessingStatus orderId={resolvedParams.orderId} />
      </div>
    </div>
  );
}
