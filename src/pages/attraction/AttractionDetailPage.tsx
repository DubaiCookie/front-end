import clsx from "clsx";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAttractionDetail } from "@/api/attraction.api";
import type { AttractionDetail } from "@/types/attraction";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/common/Button";
import AttractionContentCard from "@/components/attraction/AttractionContentCard";
import styles from "./Attraction.module.css";

export default function AttractionDetailPage() {
    const { attractionId } = useParams<{ attractionId: string }>();
    const [attraction, setAttraction] = useState<AttractionDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!attractionId) {
            return;
        }

        const fetchAttractionDetail = async () => {
            try {
                setIsLoading(true);
                const data = await getAttractionDetail(attractionId);
                setAttraction(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchAttractionDetail();
    }, [attractionId]);

    const premiumWaiting = attraction?.waitTimes.find((wait) => wait.ticketType === "PREMIUM");
    const generalWaiting = attraction?.waitTimes.find((wait) => wait.ticketType === "GENERAL");

    const ridingMinutes = attraction ? Math.round(attraction.ridingTime / 60) : 0;

    return (
        <div className={clsx("container", styles.detailPage)}>
            <LoadingSpinner isLoading={isLoading} />

            {attraction && (
                <>
                    <section className={styles.hero}>
                        <img src={attraction.imageUrl} alt={attraction.name} className={styles.heroImage} />
                        <div className={styles.heroGradient} />
                    </section>

                    <AttractionContentCard
                        attraction={attraction}
                        ridingMinutes={ridingMinutes}
                        premiumWaitingMinutes={premiumWaiting?.estimatedWaitMinutes ?? 0}
                        premiumWaitingCount={premiumWaiting?.waitingCount ?? 0}
                        generalWaitingMinutes={generalWaiting?.estimatedWaitMinutes ?? 0}
                        generalWaitingCount={generalWaiting?.waitingCount ?? 0}
                    />
                    <div className={styles.bottomSpacer} />

                    <div className="button-bottom">
                        <Button title="줄서기" className={styles.queueButton} />
                    </div>
                </>
            )}
        </div>
    );
}
