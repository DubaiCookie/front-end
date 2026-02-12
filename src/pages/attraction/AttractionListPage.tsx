import clsx from "clsx";
import { useEffect, useState } from "react";
import AttractionList from "@/components/attraction/AttractionList";
import { getAttractionList } from "@/api/attraction.api";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import type { Attraction } from "@/types/attraction";
import icon from "@/assets/icons/attraction.png";

export default function AttractionListPage() {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: error handling 필요, waitingTime api 연동 후 데이터 추가 필요
  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        setIsLoading(true);
        const data = await getAttractionList();
        
        const transformedData = data.map((attraction: { rideId: number; name: string; shortDescription: string; operatingTime: string; ridingTime: number; photo: string; }) => ({
          attractionId: attraction.rideId,
          name: attraction.name,
          description: attraction.shortDescription,
          operatingTime: attraction.operatingTime,
          waitingTime: 40, // 임시 대기시간 데이터
          ridingTime: attraction.ridingTime,
          imageUrl: attraction.photo
        }))

        setAttractions(transformedData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAttractions();
  }, []);

  return (
    <div className={clsx('container')}>
      <LoadingSpinner isLoading={isLoading} />
      <div className={clsx('page-title')}>
                <img src={icon} alt="Ticket Icon" className={clsx('title-icon')} />
        <span>어트랙션</span>
        </div>
      <AttractionList attractions={attractions} />
    </div>
  );
}
