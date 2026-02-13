import clsx from "clsx";
import { useEffect, useState } from "react";
import AttractionList from "@/components/attraction/AttractionList";
import { getAttractionList } from "@/api/attraction.api";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import type { AttractionSummary } from "@/types/attraction";
import { MdAttractions } from "react-icons/md";

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

  return (
    <div className={clsx('container')}>
      <LoadingSpinner isLoading={isLoading} />
      <div className={clsx('page-title')}>
        <div className={clsx('glass', 'title-icon-container')}>
          <MdAttractions className={clsx('title-icon')} />
        </div>
        <span>attractions</span>
      </div>
      <AttractionList attractions={attractions} />
    </div>
  );
}
