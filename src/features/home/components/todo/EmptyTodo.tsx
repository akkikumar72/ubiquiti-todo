import { RxReset } from "react-icons/rx";
import { Button, Card, Paragraph, SubHeading } from "@/components/ui";
import { useRouter } from "next/navigation";

const EmptyTodo = () => {
  const router = useRouter();
  return (
    <Card className="w-full flex-col gap-4">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <SubHeading>Nothing to do.</SubHeading>
        <Paragraph>Try typing something in input</Paragraph>
        <Button
          variant="danger"
          size="small"
          className="mt-5"
          onClick={() => router.refresh()}
          icon={<RxReset />}
        >
          Reload
        </Button>
      </div>
    </Card>
  );
};

export default EmptyTodo;
