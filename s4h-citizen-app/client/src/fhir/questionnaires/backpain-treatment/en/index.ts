import postsessionQuestionnaire from './postsession.json';
import posttrainingQuestionnaire from './posttraining.json';
import presessionQuestionnaire from './presession.json';
import pretrainingQuestionnaire from './pretraining.json';

const questionnairesEN = [
  {
    id: postsessionQuestionnaire.id,
    fhirResource: postsessionQuestionnaire,
  },
  {
    id: posttrainingQuestionnaire.id,
    fhirResource: posttrainingQuestionnaire,
  },
  {
    id: presessionQuestionnaire.id,
    fhirResource: presessionQuestionnaire,
  },
  {
    id: pretrainingQuestionnaire.id,
    fhirResource: pretrainingQuestionnaire,
  },
];

export default questionnairesEN;
