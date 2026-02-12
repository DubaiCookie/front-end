import AttractionListItem from "./AttractionListItem";
import type { Attraction } from "@/types/attraction";

type AttractionListProps = {
    attractions: Attraction[];
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
