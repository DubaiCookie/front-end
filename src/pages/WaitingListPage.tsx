import clsx from "clsx"
import { IoHourglass } from "react-icons/io5";
// import LoadingSpinner from "@/components/common/LoadingSpinner"

export default function WaitingListPage() {
    return (
        <div className={clsx('container')}>
            {/* <LoadingSpinner isLoading={isLoading} /> */}
            <div className={clsx('page-title')}>
                <div className={clsx('glass', 'title-icon-container')}>
                    <IoHourglass className={clsx('title-icon')} />
                </div>
                <span>waiting status</span>
            </div>
        </div>
    )
}