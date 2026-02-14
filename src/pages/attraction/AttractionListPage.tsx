import clsx from "clsx";
import { useEffect, useState } from "react";
import AttractionList from "@/components/attraction/AttractionList";
import { getAttractionList } from "@/api/attraction.api";
import { subscribeRidesMinutes } from "@/api/ws";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import type { AttractionSummary } from "@/types/attraction";
import { MdAttractions } from "react-icons/md";
import styles from "./Attraction.module.css";

export default function AttractionListPage() {
  const [attractions, setAttractions] = useState<AttractionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: error handling 필요
  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        setIsLoading(true);
        const data = await getAttractionList();
        setAttractions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAttractions();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeRidesMinutes((payload) => {
      setAttractions((prev) => {
        if (prev.length === 0) {
          return prev;
        }

        const waitingByRideId = new Map(payload.rides.map((ride) => [ride.rideId, ride.estimatedWaitMinutes]));
        let hasChanged = false;
        const next = prev.map((attraction) => {
          const nextWaitingMinutes = waitingByRideId.get(attraction.attractionId);
          if (nextWaitingMinutes === undefined || nextWaitingMinutes === attraction.generalWaitingTime) {
            return attraction;
          }
          hasChanged = true;
          return {
            ...attraction,
            generalWaitingTime: nextWaitingMinutes,
          };
        });

        return hasChanged ? next : prev;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className={clsx('container', styles.listPage)}>
      <LoadingSpinner isLoading={isLoading} />
      <div className={clsx('page-title')}>
        <div className={clsx('glass', 'title-icon-container')}>
          <MdAttractions className={clsx('title-icon')} />
        </div>
        <span>Attractions</span>
      </div>
      <AttractionList attractions={attractions} />
      <div className={styles.listBottomSpacer} />
    </div>
  );
}
