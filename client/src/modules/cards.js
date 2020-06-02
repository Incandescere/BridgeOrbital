const { cardsInitialState, _startNewGame, _deal, _cleanBoard, _toggleCard, _checkSet, _collectSet, tTime } = require('../util')
/* ACTION TYPES */
export const CLEAR_STATE = 'CLEAR_STATE';
export const START_NEW_GAME = 'START_NEW_GAME';
export const DEAL = 'DEAL';
export const TOGGLE_CARD = 'TOGGLE_CARD';
export const RESET_SELECTED = 'RESET_SELECTED';
export const COLLECT_SET = 'COLLECT_SET'
export const CLEAN_BOARD = 'CLEAN_BOARD'


const initialState = Object.assign({}, cardsInitialState)
/* REDUCER */
export default function (state = initialState, action) {
  switch (action.type) {
    case CLEAR_STATE:
      return Object.assign({}, cardsInitialState)
    case START_NEW_GAME: {
      return _startNewGame()
    }
    case DEAL: {
      return _deal(state)
    }
    case CLEAN_BOARD: {
      return _cleanBoard(state)
    }
    // case COLLECT:
    case TOGGLE_CARD: {
      const { index } = action
      return _toggleCard(index, state)
    }
    case COLLECT_SET: {
      const { indices } = action
      return _collectSet(indices, state)
    }
    case RESET_SELECTED:
      return Object.assign({}, state, {
        selected: {}
      })
    default:
      return state;
  }
}

/* ACTION CREATORS */
export function startNewGame() {
  return function(dispatch) {
    dispatch({ type: CLEAR_STATE })
    setTimeout(function() {
      dispatch({ type: START_NEW_GAME })
    }, tTime)
  }
}

export function deal() {
  return {
    type: DEAL
  }
}

let clickTimeout;
export function clickCard(index) {
  return function(dispatch) {
    dispatch(toggleCard(index))
    clearTimeout(clickTimeout);
    clickTimeout = setTimeout(function() {
      dispatch(checkSelected())
    }, 500)
  }
}

/* checks to see if three cards are selected.
    if they are a set, collect them,
    else clear out the selected cards
 */
function checkSelected() {
  return function(dispatch, getState) {
    const { selected } =  getState().cards
    const indices = Object.keys(selected).map(str => parseInt(str))
    if (indices.length === 3) {
      dispatch(checkSet(indices))
      dispatch({ type: RESET_SELECTED })
    }

  }
}

function checkSet(indices) {
  return function(dispatch, getState) {
    _checkSet(indices, () => {
      console.log('you found a set!')
      dispatch({
        type: COLLECT_SET,
        indices
      })
        setTimeout(function() {
          if (getState().cards.board.filter(i => i !== null).length < 12) {
            dispatch(deal())
          } else {
            dispatch({ type: CLEAN_BOARD })
          }
        }, tTime)
    })

  }

}
function toggleCard(index) {
  return {
    type: TOGGLE_CARD,
    index
  }
}