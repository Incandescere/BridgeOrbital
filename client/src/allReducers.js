import {combineReducers} from 'redux';
import cards from './modules/cards';

const rootReducer = combineReducers({
  cards
});

export default rootReducer;