import styles from './Navigation.module.css';
import clsx from 'clsx';

export default function Navigation() {
  return (
    <div className={clsx(styles.root, 'flex-row')}>
      <div>
        홈 (어트랙션 조회)
      </div>
      <div>
        입장권 확인
      </div>
      <div>
        대기 목록 조회
      </div>
      <div>
        마이페이지
      </div>
    </div>
  );
}