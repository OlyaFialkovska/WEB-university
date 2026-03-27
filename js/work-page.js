import { seedNotes } from './seed.js';
import NoteModel from './models/NoteModel.js';
import WorkView from './views/WorkView.js';
import WorkController from './controllers/WorkController.js';

seedNotes();

const model = new NoteModel();
const view = new WorkView();

new WorkController(model, view);
