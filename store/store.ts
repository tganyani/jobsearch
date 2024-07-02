import { configureStore } from '@reduxjs/toolkit'
import accountReducer from './slice/accountSlice'
import sessionReducer from './slice/sessionSlice'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux';
import { persistReducer ,FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER, } from 'redux-persist'
import modalReducer from './slice/modalSlice'
import recruiterModalReducer from './slice/recruiterModalSlice'
import refreshNewMsgReducer from './slice/refreshNewMsgSlice';
import unReadChatsReducer from './slice/chatLenghtSlice'

const reducers = combineReducers({
    account: accountReducer,
    session: sessionReducer,
    modal:modalReducer,
    recruiterModal:recruiterModalReducer,
    refreshNewMsg:refreshNewMsgReducer,
    unreadChats:unReadChatsReducer
  });

  const persistConfig = {
    key: 'root',
    storage,
    blacklist: ['modal','recruiterModal','unreadChats','refreshNewMsg']
  };
  const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({

  reducer:persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
    
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch