import { useLocation } from 'react-router';

const useGetTrackingSectionName = () => {
  const location = useLocation();
  const getTrackingSectionName = (keySuffix: String) => {
    const currentSection = location!.pathname!.split('/');
    return (
      'MEDICAL_HISTORY_' +
      currentSection[currentSection.length - 1].toUpperCase().replace('-', '_') +
      keySuffix
    );
  };
  return getTrackingSectionName;
};

export default useGetTrackingSectionName;
