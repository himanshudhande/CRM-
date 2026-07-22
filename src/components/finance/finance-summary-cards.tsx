import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export function FinanceSummaryCards({
  totalExpected,
  totalReceived,
  totalExpenses,
  net,
}: {
  totalExpected: number;
  totalReceived: number;
  totalExpenses: number;
  net: number;
}) {
  const cards = [
    { label: "Expected", value: totalExpected },
    { label: "Received", value: totalReceived },
    { label: "Expenses", value: totalExpenses },
    { label: "Net", value: net, emphasize: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-xl font-semibold tracking-tight",
                card.emphasize && card.value < 0 && "text-destructive"
              )}
            >
              {formatCurrency(card.value)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
