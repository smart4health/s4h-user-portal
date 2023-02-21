import { useTranslation } from 'react-i18next';
import { formatDate } from '../utils/dateHelper';

const useGetFormattedDate = () => {
  const { i18n } = useTranslation();

  const getFormattedDate = (date: Date, format: string) => {
    return formatDate(date, format, i18n.language);
  };
  return getFormattedDate;
};

export default useGetFormattedDate;
