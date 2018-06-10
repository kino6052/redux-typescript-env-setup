import { combineReducers, Action, Reducer, ReducersMapObject } from 'redux';
import {
  SELECT_SUBREDDIT,
  INVALIDATE_SUBREDDIT,
  REQUEST_POSTS,
  RECEIVE_POSTS,
  AppAction,
  AppState
} from "../actions";

const selectedSubreddit = (state = 'reactjs', action: AppAction) => {
  switch (action.type) {
    case SELECT_SUBREDDIT:
      return action.subreddit;
    default:
      return state;
  }
}

const posts = (state: AppState = {
  isFetching: false,
  didInvalidate: false,
  items: []
}, action: AppAction): AppState => {
  switch (action.type) {
    case INVALIDATE_SUBREDDIT:
      return {
        ...state,
        didInvalidate: true
      }
    case REQUEST_POSTS:
      return {
        ...state,
        isFetching: true,
        didInvalidate: false
      }
    case RECEIVE_POSTS:
      return {
        ...state,
        isFetching: false,
        didInvalidate: false,
        items: action.posts,
        lastUpdated: action.receivedAt
      }
    default:
      return state
  }
}

const postsBySubreddit = (state: AppState = { }, action: AppAction) => {
  switch (action.type) {
    case INVALIDATE_SUBREDDIT:
    case RECEIVE_POSTS:
    case REQUEST_POSTS:
      return {
        ...state,
        [action.subreddit]: posts(state[action.subreddit], action),
      }
    default:
      return state
  }
}

let reducerMap = (one: Reducer<AppState>, two: Reducer<AppState>): ReducersMapObject => {
  return {
    one,
    two
  }
}

const rootReducer = combineReducers(
  reducerMap(
    postsBySubreddit,
    selectedSubreddit
  )
)

export default rootReducer
