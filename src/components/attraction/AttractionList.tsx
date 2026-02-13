import AttractionListItem from "./AttractionListItem";
import type { AttractionSummary } from "@/types/attraction";

type AttractionListProps = {
    attractions: AttractionSummary[];
};

export default function AttractionList({ attractions }: AttractionListProps) {
    return (
        <div>
            {attractions.map((attraction) => (
                <AttractionListItem key={attraction.attractionId} attraction={attraction} />
            ))}
        </div>
    );
}
