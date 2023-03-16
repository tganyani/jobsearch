import { configureStore } from '@reduxjs/toolkit'
import accountReducer from './slice/accountSlice'
import sessionReducer from './slice/sessionSlice'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist'
import modalReducer from './slice/modalSlice'
import recruiterModalReducer from './slice/recruiterModalSlice'
import refreshNewMsgReducer from './slice/refreshNewMsgSlice';

const reducers = combineReducers({
    account: accountReducer,
    session: sessionReducer,
    modal:modalReducer,
    recruiterModal:recruiterModalReducer,
    refreshNewMsg:refreshNewMsgReducer
  });

  const persistConfig = {
    key: 'root',
    storage,
    blacklist: ['modal','recruiterModal']
  };
  const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({

  reducer:persistedReducer
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch