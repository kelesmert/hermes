import { useContext } from 'react';
import { SessionContext } from '@/features/auth/context/session-context.jsx';

const useSession = () => useContext(SessionContext);

export default useSession;
