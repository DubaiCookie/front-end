import clsx from "clsx";
import { useEffect, useState } from "react";
import AttractionList from "@/components/attraction/AttractionList";
import { getAttractionList } from "@/api/attraction.api";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import type { AttractionSummary } from "@/types/attraction";
import { MdAttractions } from "react-icons/md";
import Modal from "@/components/common/Modal";
import { useLocation, useNavigate } from "react-router-dom";

export default function AttractionListPage() {
  const [attractions, setAttractions] = useState<AttractionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if ((location.state as { showLogoutModal?: boolean } | null)?.showLogoutModal) {
      setIsLogoutModalOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

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
      <Modal
        isOpen={isLogoutModalOpen}
        title="로그아웃 완료"
        content="정상적으로 로그아웃되었습니다."
        buttonTitle="확인"
        onButtonClick={() => {
          setIsLogoutModalOpen(false);
        }}
      />
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
