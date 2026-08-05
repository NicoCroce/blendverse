import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';

export const OkIcon = () => (
  <FontAwesomeIcon icon={faCircleCheck} color="green" />
);
export const NotIcon = () => (
  <FontAwesomeIcon icon={faCircleExclamation} className="text-amber-700" />
);
