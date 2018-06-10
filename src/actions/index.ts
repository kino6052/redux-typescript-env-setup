import {Action, ActionCreator, AnyAction, Dispatch, MiddlewareAPI} from 'redux';
import {ThunkAction, ThunkMiddleware} from 'redux-thunk';
export const REQUEST_POSTS = 'REQUEST_POSTS';
export const RECEIVE_POSTS = 'RECEIVE_POSTS';
export const SELECT_SUBREDDIT = 'SELECT_SUBREDDIT';
export const INVALIDATE_SUBREDDIT = 'INVALIDATE_SUBREDDIT';

export interface AppAction extends Action {
  type: string,
  subreddit: string,
  posts?: Array<string>,
  receivedAt?: number,
}

export interface AppState {
  [key: string]: any,
  posts?: Array<string>,
  receivedAt?: number,
  subreddit?: string,
  isFetching?: boolean,
  didInvalidate?: boolean,
  items?: Array<string>,
  lastUpdated?: number
}


export const selectSubreddit: ActionCreator<AppAction> = subreddit => ({
  type: SELECT_SUBREDDIT,
  subreddit
});

export const invalidateSubreddit: ActionCreator<AppAction> = subreddit => ({
  type: INVALIDATE_SUBREDDIT,
  subreddit
})

export const requestPosts: ActionCreator<AppAction> = subreddit => ({
  type: REQUEST_POSTS,
  subreddit
})

interface JSONChild {
  data: string
}

interface JSONResponse {
  data: {
    children: Array<JSONChild>
  }
}
export const receivePosts: ActionCreator<AppAction> = (subreddit: string, json: JSONResponse) => ({
  type: RECEIVE_POSTS,
  subreddit,
  posts: <Array<string>>json.data.children.map((child: JSONChild) => child.data),
  receivedAt: Date.now()
})

const fetchPosts: ActionCreator<ThunkAction<Promise<AppAction>, AppState, void, AppAction>> = (subreddit: string) => (dispatch: Dispatch<AppAction>) => {
  dispatch(requestPosts(subreddit))
  return <Promise<AppAction>>fetch(`https://www.reddit.com/r/${subreddit}.json`)
    .then(response => response.json())
    .then(json => dispatch(receivePosts(subreddit, json)))
}

const shouldFetchPosts: ActionCreator<AppAction> = (state, subreddit) => {
  const posts = state.postsBySubreddit[subreddit]
  if (!posts) {
    return true
  }
  if (posts.isFetching) {
    return false
  }
  return posts.didInvalidate
}

export const fetchPostsIfNeeded: ActionCreator<ThunkAction<Promise<AppAction>, AppState, void, AppAction>> = (subreddit: string) => (dispatch, getState) => {
  if (shouldFetchPosts(getState(), subreddit)) {
    return dispatch(fetchPosts(subreddit))
  }
  return new Promise<AppAction>((res, rej)=>{
    res();
  });
}
