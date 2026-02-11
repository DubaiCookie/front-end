 import clsx from "clsx";
 import AttractionList from "@/components/attraction/AttractionList";
 
 export default function EventPage() {
  return (
    <div className={clsx('container')}>
      <div className={clsx('page-title')}>어트랙션</div>
      <AttractionList />
    </div>
  );
}
